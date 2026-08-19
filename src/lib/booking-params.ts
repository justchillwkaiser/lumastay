// Booking flow URL params — single source of truth (plan 3 task 2).
// Booking state across the 5 steps lives in URL searchParams + server
// re-validation at each step (no client-global store; RSC-friendly).
// Pure functions, no DB.

export interface BookingParams {
  property: string | null;
  checkIn: string | null; // YYYY-MM-DD
  checkOut: string | null; // YYYY-MM-DD
  adults: number; // 1..16, default 2
  children: number; // 0..10, default 0
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value: string | null): string | null {
  if (!value || !DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : value;
}

function clampInt(
  value: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (value === null) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function parseBookingParams(sp: URLSearchParams): BookingParams {
  const checkIn = parseDateParam(sp.get("checkIn"));
  let checkOut = parseDateParam(sp.get("checkOut"));
  // A range with checkout <= checkin is not a range — drop the checkout.
  if (checkIn && checkOut && checkOut <= checkIn) checkOut = null;

  return {
    property: sp.get("property") || null,
    checkIn,
    checkOut,
    adults: clampInt(sp.get("adults"), 1, 16, 2),
    children: clampInt(sp.get("children"), 0, 10, 0),
  };
}

/** Serialize back to a query string (nulls omitted) — used by step nav. */
export function bookingParamsToSearch(params: BookingParams): string {
  const sp = new URLSearchParams();
  if (params.property) sp.set("property", params.property);
  if (params.checkIn) sp.set("checkIn", params.checkIn);
  if (params.checkOut) sp.set("checkOut", params.checkOut);
  sp.set("adults", String(params.adults));
  sp.set("children", String(params.children));
  return sp.toString();
}
