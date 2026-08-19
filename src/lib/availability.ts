// Availability engine — spec §6.
// Bookable iff NO overlapping PENDING/CONFIRMED booking AND NO overlapping
// AvailabilityBlock for the property. Overlap predicate is end-EXCLUSIVE:
// (checkIn < existing.checkOut) && (checkOut > existing.checkIn) — the
// checkout day is free for the next guest.
//
// FAIL-CLOSED rule:
//  - isRangeBookable: DB error => false. Booking mutations must never
//    silently succeed offline.
//  - getDateStates: DB error => all-"available" fallback, RENDER-ONLY
//    (calendar paint). Any actual booking still passes isRangeBookable.

import { db } from "@/lib/db";

export type DateState = "available" | "past" | "booked" | "blocked" | "hold";

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

function toDay(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (dates are @db.Date, UTC midnight)
}

/** "Today" as YYYY-MM-DD in the property's timezone (Asia/Kuala_Lumpur). */
function todayKL(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** End-exclusive overlap: checkout/end day is free for the next guest. */
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

interface RangeRow {
  start: string;
  end: string;
}

async function fetchRanges(
  propertyId: string,
): Promise<{ bookings: RangeRow[]; blocks: (RangeRow & { type: string })[] }> {
  const [bookingRows, blockRows] = await Promise.all([
    db.booking.findMany({
      where: { propertyId, status: { in: [...BLOCKING_STATUSES] } },
      select: { checkIn: true, checkOut: true, status: true },
    }),
    db.availabilityBlock.findMany({
      where: { propertyId },
      select: { startDate: true, endDate: true, type: true },
    }),
  ]);
  return {
    bookings: bookingRows.map((b) => ({ start: toDay(b.checkIn), end: toDay(b.checkOut) })),
    blocks: blockRows.map((b) => ({ start: toDay(b.startDate), end: toDay(b.endDate), type: b.type })),
  };
}

export async function isRangeBookable(
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  if (!(checkIn < checkOut)) return false;
  let ranges: Awaited<ReturnType<typeof fetchRanges>>;
  try {
    ranges = await fetchRanges(propertyId);
  } catch {
    return false; // FAIL CLOSED — never allow a booking we cannot verify
  }
  for (const b of ranges.bookings) {
    if (overlaps(checkIn, checkOut, b.start, b.end)) return false;
  }
  for (const b of ranges.blocks) {
    if (overlaps(checkIn, checkOut, b.start, b.end)) return false;
  }
  return true;
}

/**
 * Calendar states for one month, keyed by YYYY-MM-DD.
 * Merge precedence: past > blocked/hold (AvailabilityBlock) > booked > available.
 * `month` is 1-based (1 = January).
 */
export async function getDateStates(
  propertyId: string,
  year: number,
  month: number,
): Promise<Record<string, DateState>> {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const keys: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    keys.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  const states: Record<string, DateState> = {};
  const today = todayKL();
  for (const k of keys) states[k] = k < today ? "past" : "available";

  let ranges: Awaited<ReturnType<typeof fetchRanges>>;
  try {
    ranges = await fetchRanges(propertyId);
  } catch {
    return states; // render-only fallback; booking guard stays fail-closed
  }

  // Nights occupied are [start, end) — end day (checkout) is available again.
  const covers = (day: string, r: RangeRow) => day >= r.start && day < r.end;

  for (const k of keys) {
    if (states[k] === "past") continue;
    for (const b of ranges.blocks) {
      if (covers(k, b)) {
        states[k] = b.type === "HOLD" ? "hold" : "blocked";
        break;
      }
    }
    if (states[k] === "available") {
      for (const b of ranges.bookings) {
        if (covers(k, b)) {
          states[k] = "booked";
          break;
        }
      }
    }
  }
  return states;
}
