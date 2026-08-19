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
  // Contact fields (task 3 details page) — carried forward as URL params
  // via a GET form so the review page stays a pure RSC.
  name: string | null;
  email: string | null;
  phone: string | null;
  requests: string | null;
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

function parseTextParam(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
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
    name: parseTextParam(sp.get("name")),
    email: parseTextParam(sp.get("email")),
    phone: parseTextParam(sp.get("phone")),
    requests: parseTextParam(sp.get("requests")),
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
  if (params.name) sp.set("name", params.name);
  if (params.email) sp.set("email", params.email);
  if (params.phone) sp.set("phone", params.phone);
  if (params.requests) sp.set("requests", params.requests);
  return sp.toString();
}

// ---------------------------------------------------------------------------
// Step guards (plan 3 task 3): each step page re-validates the URL state on
// the server. Missing prerequisites throw `REDIRECT:<path>`, which the page
// catches and turns into next/navigation redirect().
// ---------------------------------------------------------------------------

export type BookingStep = "dates" | "guests" | "details" | "review";

const STEP_REQUIREMENTS: Record<
  BookingStep,
  { missing: (p: BookingParams) => boolean; redirectTo: string }
> = {
  dates: { missing: () => false, redirectTo: "/book/dates" },
  guests: {
    missing: (p) => !p.property || !p.checkIn || !p.checkOut,
    redirectTo: "/book/dates",
  },
  details: {
    missing: (p) => !p.property || !p.checkIn || !p.checkOut,
    redirectTo: "/book/dates",
  },
  review: {
    missing: (p) =>
      !p.property || !p.checkIn || !p.checkOut || !p.name || !p.email || !p.phone,
    redirectTo: "/book/details",
  },
};

export function requireParamsFor(step: BookingStep, params: BookingParams): void {
  const req = STEP_REQUIREMENTS[step];
  const target = params.property
    ? `${req.redirectTo}?property=${params.property}`
    : req.redirectTo;
  if (req.missing(params)) {
    throw new Error(`REDIRECT:${target}`);
  }
}
