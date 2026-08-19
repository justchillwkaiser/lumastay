// Admin availability calendar matrix — plan 3 task 10.
// MON-first weeks covering the month; cell states merge bookings (with
// guest label) + blocks; trailing prev/next-month days flagged muted.
// "all" = union across properties: booked if ANY property is booked.
// DB offline => all-available matrix (render-only; the booking guard
// isRangeBookable stays fail-closed).

import { db } from "@/lib/db";

export interface AdminCalendarCell {
  date: string; // YYYY-MM-DD
  day: number;
  muted: boolean; // prev/next month padding
  state: "available" | "booked" | "blocked" | "hold";
  label?: string; // guest name for booked cells / block label
}

export interface AdminMonthMatrix {
  year: number;
  month: number; // 1-based
  weeks: AdminCalendarCell[][];
}

function keyOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getAdminMonthMatrix(
  propertyId: string | "all",
  year: number,
  month: number,
): Promise<AdminMonthMatrix> {
  // State map for the visible month.
  const states = new Map<string, { state: AdminCalendarCell["state"]; label?: string }>();

  try {
    const where =
      propertyId === "all" ? {} : { propertyId };
    const [bookings, blocks] = await Promise.all([
      db.booking.findMany({
        where: { ...where, status: { in: ["PENDING", "CONFIRMED"] } },
        include: { guest: true, property: true },
      }),
      db.availabilityBlock.findMany({ where }),
    ]);

    for (const b of bookings) {
      const start = keyOf(b.checkIn);
      const end = keyOf(b.checkOut);
      for (
        let t = new Date(`${start}T00:00:00Z`).getTime();
        t < new Date(`${end}T00:00:00Z`).getTime();
        t += 86400000
      ) {
        states.set(keyOf(new Date(t)), {
          state: "booked",
          label: b.guest.name,
        });
      }
    }
    for (const b of blocks) {
      const start = keyOf(b.startDate);
      const end = keyOf(b.endDate);
      for (
        let t = new Date(`${start}T00:00:00Z`).getTime();
        t < new Date(`${end}T00:00:00Z`).getTime();
        t += 86400000
      ) {
        states.set(keyOf(new Date(t)), {
          state: b.type === "HOLD" ? "hold" : "blocked",
          label: b.label ?? undefined,
        });
      }
    }
  } catch {
    // render-only fallback: all-available
  }

  // Build MON-first weeks covering the month.
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekdayMon0 = (first.getUTCDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(first.getTime() - firstWeekdayMon0 * 86400000);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalCells = firstWeekdayMon0 + daysInMonth;
  const weekCount = Math.ceil(totalCells / 7);

  const weeks: AdminCalendarCell[][] = [];
  for (let w = 0; w < weekCount; w++) {
    const week: AdminCalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart.getTime() + (w * 7 + d) * 86400000);
      const k = keyOf(date);
      const inMonth = date.getUTCMonth() === month - 1;
      const hit = states.get(k);
      week.push({
        date: k,
        day: date.getUTCDate(),
        muted: !inMonth,
        state: hit?.state ?? "available",
        label: hit?.label,
      });
    }
    weeks.push(week);
  }

  return { year, month, weeks };
}
