# LumaStay — Booking Engine + Admin Implementation Plan (Plan 3 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the booking engine (availability, pricing, 5-step flow, mock payment) and the admin dashboard (Overview, Bookings, Booking Detail, Calendar) pixel-faithful to mockups, then deploy.

**Architecture:** Server-side availability engine + pricing recompute are the single guards (client never trusted). Booking state across the 5 steps lives in URL searchParams + server re-validation at each step (no client-global store; RSC-friendly). MockPaymentProvider behind the PaymentProvider interface. Admin pages are RSC with TanStack Table in client leaves. Role-gated via Plan 1 proxy + guards.

**Tech Stack:** Next.js 16 · Prisma 7 · Better Auth · react-hook-form + zod · TanStack Table · motion/react · Vitest · Playwright

**Spec:** `docs/specs/2026-08-19-lumastay-design.md` (§4 routes, §5 functional reqs, §6 data model)
**Depends on:** Plan 1 (foundation), Plan 2 (guest surfaces)

## Global Constraints

- Availability rule (spec §6): bookable iff no overlapping PENDING/CONFIRMED booking and no overlapping AvailabilityBlock for the property
- Pricing ALWAYS recomputed server-side from Property rates (spec FR-1.5); client totals never trusted
- Booking reference: `LS-####` from Postgres sequence, unique, zero-padded ≥ 4 digits
- Calendar states verbatim: past = hatched; endpoints = solid `primary` white numerals; range = `primary-fixed-dim` sage band; blocked = `surface-dim` + `Prohibit` (⊘) icon; hold = sage block dark text; booked = `primary-container` block white text
- Stepper two variants verbatim: text-style (DATES underlined) for steps 1–3; circle-style (✓ filled + outlined current number) for step 4+
- Booking Confirmed check = dark rounded square + white check (NOT green)
- Admin status pills per Plan 1 Badge tones; table interactions client-side (TanStack), data RSC
- Two-layer guards: proxy + server-side `requireAdmin()` in every admin page/mutation
- Verification per task: `npm run typecheck && npm test && npm run build`; Playwright E2E at Tasks 6 and 12

---

### Task 1: Availability engine + pricing service

**Files:**
- Create: `src/lib/availability.ts`, `src/lib/pricing.ts`, `src/lib/booking-reference.ts`, `tests/availability.test.ts`, `tests/pricing.test.ts`, `tests/booking-reference.test.ts`

**Interfaces:**
- Produces:
  - `getDateStates(propertyId: string, year: number, month: number): Promise<Record<string, DateState>>` — `DateState = "available" | "past" | "booked" | "blocked" | "hold"` keyed by `YYYY-MM-DD`
  - `isRangeBookable(propertyId: string, checkIn: string, checkOut: string): Promise<boolean>`
  - `computePrice(property: { nightlyRate: string; cleaningFee: string; serviceFeePct: string; taxPct: string }, nights: number): PriceBreakdown` — `PriceBreakdown = { nights: number; nightlyRate: string; subtotal: string; cleaningFee: string; serviceFee: string; taxAmount: string; total: string }`
  - `nextBookingReference(): Promise<string>` — `LS-1042`

- [x] **Step 1: Write failing tests**

`tests/pricing.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computePrice } from "@/lib/pricing";

const pavilion = { nightlyRate: "3200.00", cleaningFee: "400.00", serviceFeePct: "5.0", taxPct: "0" };

describe("computePrice", () => {
  it("replicates review-page math (4 nights)", () => {
    const p = computePrice(pavilion, 4);
    expect(p.subtotal).toBe("12800.00");
    expect(p.cleaningFee).toBe("400.00");
    expect(p.serviceFee).toBe("660.00"); // 5% of (subtotal + cleaning)
    expect(p.total).toBe("13860.00");
  });
  it("1 night minimum math", () => {
    const p = computePrice(pavilion, 1);
    expect(p.subtotal).toBe("3200.00");
    expect(p.total).toBe("3780.00"); // 3200 + 400 + 180
  });
  it("zero nights throws", () => {
    expect(() => computePrice(pavilion, 0)).toThrow();
  });
});
```

`tests/availability.test.ts` (mock db with `vi.hoisted` + `vi.mock("@/lib/db")`):
```ts
import { describe, it, expect, vi } from "vitest";

const { bookingFindMany, blockFindMany } = vi.hoisted(() => ({
  bookingFindMany: vi.fn(), blockFindMany: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    booking: { findMany: bookingFindMany },
    availabilityBlock: { findMany: blockFindMany },
  },
}));

describe("availability engine", () => {
  it("overlapping confirmed booking => not bookable", async () => {
    bookingFindMany.mockResolvedValue([{ checkIn: new Date("2024-10-12"), checkOut: new Date("2024-10-15"), status: "CONFIRMED" }]);
    blockFindMany.mockResolvedValue([]);
    const { isRangeBookable } = await import("@/lib/availability");
    expect(await isRangeBookable("p1", "2024-10-14", "2024-10-16")).toBe(false);
    expect(await isRangeBookable("p1", "2024-10-15", "2024-10-17")).toBe(true); // checkout day is free
  });
  it("availability block => not bookable", async () => {
    bookingFindMany.mockResolvedValue([]);
    blockFindMany.mockResolvedValue([{ startDate: new Date("2024-10-10"), endDate: new Date("2024-10-12"), type: "BLOCKED" }]);
    const { isRangeBookable } = await import("@/lib/availability");
    expect(await isRangeBookable("p1", "2024-10-09", "2024-10-11")).toBe(false);
  });
  it("db error => fail closed (not bookable)", async () => {
    bookingFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    blockFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    const { isRangeBookable } = await import("@/lib/availability");
    expect(await isRangeBookable("p1", "2024-10-20", "2024-10-22")).toBe(false);
  });
});
```

`tests/booking-reference.test.ts`: mock sequence query → expect format `/^LS-\d{4,}$/`.

- [x] **Step 2: Run tests — verify FAIL**

- [x] **Step 3: Implement**

`src/lib/pricing.ts`: decimal math via string-safe integer cents (multiply by 100, round half-up); serviceFee = pct × (subtotal + cleaningFee); tax = pct × (subtotal + cleaning + service); throw on nights < 1.

`src/lib/availability.ts`: overlap predicate `(checkIn < existing.checkOut) && (checkOut > existing.checkIn)` — checkout day is free for next guest. `getDateStates` merges: past (before today, Asia/Kuala_Lumpur) > blocked/hold (AvailabilityBlock) > booked (PENDING/CONFIRMED booking overlap) > available. DB error: `getDateStates` returns all-"available" fallback ONLY for render (pages), but `isRangeBookable` FAILS CLOSED (booking mutations must never silently succeed offline).

`src/lib/booking-reference.ts`: `CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1024` (ensure in migration); `SELECT nextval('booking_ref_seq')` → `LS-${n}`. Retry on unique collision.

- [x] **Step 4: Run tests — verify PASS + typecheck**

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: availability engine + pricing + booking reference"
```

---

### Task 2: Booking flow state + custom date picker

**Files:**
- Create: `src/components/guest/booking/DatePicker.tsx`, `src/components/guest/booking/BookingStepper.tsx`, `src/components/guest/booking/SummaryCard.tsx`, `src/lib/booking-params.ts`, `tests/booking-params.test.ts`, `tests/date-picker.test.tsx`

**Interfaces:**
- Produces:
  - `parseBookingParams(sp: URLSearchParams): BookingParams` — `{ property, checkIn, checkOut, adults, children }` with validation/normalization
  - `<DatePicker month states value onChange />` client leaf — range select, keyboard arrows, states styled per constraints
  - `<BookingStepper step={1..5} variant="text|circle" />`
  - `<SummaryCard property params breakdown />` (right-column card per mockups)

- [x] **Step 1: Write failing tests**

`tests/booking-params.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseBookingParams } from "@/lib/booking-params";

describe("parseBookingParams", () => {
  it("parses valid params", () => {
    const p = parseBookingParams(new URLSearchParams("property=the-pavilion&checkIn=2024-10-12&checkOut=2024-10-15&adults=2&children=1"));
    expect(p).toEqual({ property: "the-pavilion", checkIn: "2024-10-12", checkOut: "2024-10-15", adults: 2, children: 1 });
  });
  it("rejects checkout <= checkin", () => {
    const p = parseBookingParams(new URLSearchParams("property=x&checkIn=2024-10-15&checkOut=2024-10-15"));
    expect(p.checkOut).toBeNull();
  });
  it("clamps adults to 1..16, children 0..10", () => {
    const p = parseBookingParams(new URLSearchParams("adults=99&children=-3"));
    expect(p.adults).toBe(16); expect(p.children).toBe(0);
  });
  it("defaults when missing", () => {
    const p = parseBookingParams(new URLSearchParams());
    expect(p.adults).toBe(2); expect(p.children).toBe(0);
    expect(p.checkIn).toBeNull(); expect(p.checkOut).toBeNull();
  });
});
```

`tests/date-picker.test.tsx`: render with `states` map; assert `2024-10-12` cell has `bg-primary` + white text, `2024-10-13` has sage band class, past cell has hatch class (`bg-[repeating-linear-gradient` or data-attr), clicking 12 then 15 calls `onChange("2024-10-12","2024-10-15")`; clicking an already-selected start resets range.

- [x] **Step 2: Run tests — verify FAIL**

- [x] **Step 3: Implement**

`booking-params.ts`: pure functions, no DB.

`DatePicker.tsx` (`"use client"`): month grid S M T W T F S header (LabelCaps gray); cells 40px; states via `data-state` attr + token classes; hatch = `bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,var(--color-surface-dim)_3px,var(--color-surface-dim)_4px)]`; range logic: first click = checkIn, second click > checkIn = checkOut (validate no non-available date strictly inside range — use provided `states`), else reset; `‹ ›` month nav (square outlined buttons); keyboard: arrows move focus, Enter selects; `aria-label` per cell ("12 October 2024, available").

`BookingStepper`: variant "text" — row of LabelCaps items, active = `on-surface` + 2px `primary` underline, done = `on-surface-variant`, upcoming = muted; variant "circle" — 28px circles, done = filled `primary` + white `Check`, current = 1px outline + number, connector hairlines; labels below.

`SummaryCard`: grayscale villa thumb (`grayscale` filter), LabelCaps "THE VILLAS" + property shortName, `mono-data` rate, Divider, CHECK-IN/CHECK-OUT two-col (LabelCaps + value or "—"), Divider, breakdown rows (`mono-data`, underlined-label style per mockup where applicable), Divider, TOTAL row large bold, slot for CTA button (children).

- [x] **Step 4: Run tests — PASS + typecheck + build**

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: booking params, date picker, stepper, summary card"
```

---

### Task 3: Step pages — dates, guests, details

**Files:**
- Create: `src/app/(guest)/book/layout.tsx`, `src/app/(guest)/book/dates/page.tsx`, `src/app/(guest)/book/guests/page.tsx`, `src/app/(guest)/book/details/page.tsx`, `src/app/(guest)/book/dates/ContinueButton.tsx` (shared client nav), `tests/booking-steps.test.ts`

**Interfaces:**
- Consumes: Task 1 + 2 exports; `getPropertyBySlug` (Plan 2)
- Produces: `/book/dates|guests|details` with secure-booking chrome (brand left, "SECURE BOOKING" center, black `Close` right → `/villas/[slug]`)

- [x] **Step 1: Write failing test**

`tests/booking-steps.test.ts`: unit-test the redirect guards each page uses:
```ts
import { describe, it, expect } from "vitest";
import { requireParamsFor } from "@/lib/booking-params";

describe("step guards", () => {
  it("guests requires dates", () => {
    expect(() => requireParamsFor("guests", { property: "p", checkIn: null, checkOut: null, adults: 2, children: 0 })).toThrow("REDIRECT:/book/dates");
  });
  it("details requires dates + guests", () => {
    expect(() => requireParamsFor("details", { property: "p", checkIn: "2024-10-12", checkOut: "2024-10-15", adults: 2, children: 0 })).not.toThrow();
  });
});
```

(Implement `requireParamsFor(step, params)` in `booking-params.ts` — throws `REDIRECT:<path>` caught by page to `redirect()`.)

- [x] **Step 2: Run test — verify FAIL**

- [x] **Step 3: Implement**

`book/layout.tsx`: minimal chrome (NOT guest TopNavBar): h-16, brand wordmark left, LabelCaps "SECURE BOOKING" center, black Button "Close" right; 1px bottom border; Footer below children.

`dates/page.tsx` (RSC, awaits `searchParams`): property via `getPropertyBySlug(params.property ?? "the-pavilion")`; `getDateStates` for visible month; render text stepper step=1, headline-md "Select your dates", DatePicker (initial month from checkIn or current), SummaryCard + ContinueButton → builds `/book/guests?...` (disabled until valid range). Client ContinueButton receives params via props (no `useSearchParams`).

`guests/page.tsx`: step guard; stepper step=2; counter rows (Adults 16+, Children 0–12) with minus/plus square buttons (client leaf, `Minus`/`Plus` phosphor), capacity note from property (`maxGuests`); SummaryCard shows "N Adults, M Children"; Continue → `/book/details?...`.

`details/page.tsx`: step guard; stepper step=3; react-hook-form + zod: `name` (min 2), `email`, `phone` (`/^\+60[\d\s-]{8,}$/`), `specialRequests` optional textarea; Input primitive (label-caps above, error below); values carried forward as URL params on submit (GET form → `/book/review?...&name=...&email=...&phone=...&requests=...`) so Review remains RSC. Add phone/name/email/requests to `BookingParams` + parser + tests (update Task 2 test expectations accordingly).

- [x] **Step 4: Run test — PASS + build + render check (`curl "/book/dates?property=the-pavilion" | grep "Select your dates"`)**

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: booking steps dates/guests/details"
```

---

### Task 4: Booking creation API + review + confirm

**Files:**
- Create: `src/app/api/bookings/route.ts`, `src/app/(guest)/book/review/page.tsx`, `src/app/(guest)/book/review/ConfirmButton.tsx`, `src/lib/bookings.ts`, `tests/bookings-create.test.ts`

**Interfaces:**
- Produces: `createBooking(input): Promise<{ reference: string } | { error: string }>` in `lib/bookings.ts` — validates + recomputes + inserts in a transaction (guest upsert by email; booking; optional payment row); POST `/api/bookings`

- [x] **Step 1: Write failing test**

`tests/bookings-create.test.ts` (mock db + availability):
```ts
import { describe, it, expect, vi } from "vitest";

const { tx, bookable } = vi.hoisted(() => ({ tx: vi.fn(), bookable: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { $transaction: tx } }));
vi.mock("@/lib/availability", () => ({ isRangeBookable: bookable }));
vi.mock("@/lib/booking-reference", () => ({ nextBookingReference: async () => "LS-1042" }));
vi.mock("@/lib/properties", () => ({
  getPropertyBySlug: async () => ({
    id: "p1", slug: "the-pavilion", nightlyRate: "3200.00",
    cleaningFee: "400.00", serviceFeePct: "5.0", taxPct: "0", maxGuests: 8,
  }),
}));

const input = {
  property: "the-pavilion", checkIn: "2024-10-24", checkOut: "2024-10-28",
  adults: 2, children: 0, name: "Alexander Wright",
  email: "a.wright@example.com", phone: "+60 12 345 6789", specialRequests: "",
};

describe("createBooking", () => {
  it("recomputes price server-side, ignores client totals", async () => {
    bookable.mockResolvedValue(true);
    tx.mockImplementation(async (fn: any) => fn({
      guest: { upsert: async () => ({ id: "g1" }) },
      booking: { create: async (a: any) => a.data },
    }));
    const { createBooking } = await import("@/lib/bookings");
    const res = await createBooking({ ...input, clientTotal: "1.00" });
    expect(res).toEqual({ reference: "LS-1042" });
  });
  it("rejects when range not bookable", async () => {
    bookable.mockResolvedValue(false);
    const { createBooking } = await import("@/lib/bookings");
    const res = await createBooking(input);
    expect(res).toEqual({ error: "DATES_UNAVAILABLE" });
  });
  it("rejects guests over capacity", async () => {
    bookable.mockResolvedValue(true);
    const { createBooking } = await import("@/lib/bookings");
    const res = await createBooking({ ...input, adults: 9 });
    expect(res).toEqual({ error: "OVER_CAPACITY" });
  });
});
```

- [x] **Step 2: Run test — verify FAIL**

- [x] **Step 3: Implement**

`lib/bookings.ts`: zod-validate input → capacity check → `isRangeBookable` (fail closed) → `computePrice` from DB property → `$transaction`: guest upsert by email, booking create (snapshots + reference), payment row PENDING (method from provider factory, `mock` default) → return reference. API route: POST → JSON; 400 on `{error}`.

`review/page.tsx`: full params guard (dates+guests+details); circle stepper step=4; centered headline-md "Review Your Stay"; left cards: Booking Summary (PROPERTY/GUESTS/CHECK-IN "Oct 24, 2024 - From 3:00 PM"/CHECK-OUT rows per mockup + room thumb "Private Villa with Pool / Non-smoking • 1 King Bed") + Guest Details (PRIMARY GUEST, CONTACT email+phone); right: price card (`computePrice` rows verbatim "4 nights x RM 3,200", Cleaning Fee, Service Fee, divider, Total + "MYR" label + "Includes taxes and fees") + ConfirmButton (POST, loading state, on success redirect `/book/confirmed?ref=LS-1042`) + terms line verbatim "By confirming this booking, you agree to our Terms of Service and Privacy Policy."

- [x] **Step 4: Run test — PASS + build**

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: booking creation + review step"
```

---

### Task 5: Confirmed page + ICS + lookup + account claim

**Files:**
- Create: `src/app/(guest)/book/confirmed/page.tsx`, `src/lib/ics.ts`, `src/app/api/bookings/[ref]/ics/route.ts`, `src/app/(guest)/bookings/lookup/page.tsx`, `tests/ics.test.ts`

**Interfaces:**
- Produces: `/book/confirmed?ref=` (circle stepper step=5); `buildIcs(booking): string`; `/api/bookings/[ref]/ics` download; `/bookings/lookup` (ref + email → detail)

- [ ] **Step 1: Write failing test**

`tests/ics.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildIcs } from "@/lib/ics";

describe("buildIcs", () => {
  it("emits valid VEVENT with dates + summary", () => {
    const ics = buildIcs({
      reference: "LS-1024", propertyName: "The Pavilion at Hulu Langat",
      locationLine: "Hulu Langat, Selangor, Malaysia",
      checkIn: "2024-11-12", checkOut: "2024-11-18",
      checkInTime: "3:00 PM", checkOutTime: "11:00 AM",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:LumaStay - The Pavilion at Hulu Langat (LS-1024)");
    expect(ics).toContain("DTSTART:20241112T150000");
    expect(ics).toContain("DTEND:20241118T110000");
    expect(ics).toContain("LOCATION:Hulu Langat\\, Selangor\\, Malaysia");
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

`ics.ts`: CRLF line endings, escape commas, `UID` = reference@lumastay.

`confirmed/page.tsx`: fetch booking by `ref` (fallback: demo booking for `LS-1024` when offline); centered card: dark rounded square (`primary`, radius 8px, 56px) + white `Check` 28px; headline-md "Confirmed"; subcopy verbatim "Your sanctuary awaits. Check-in instructions will be sent to your email closer to your arrival date."; Divider; 2-col split (vertical hairline): left BOOKING REFERENCE `#LS-1024`, PROPERTY + location, GUEST + email; right CHECK IN "Nov 12" bold + "3:00 PM", `ArrowRight`, CHECK OUT "Nov 18" + "11:00 AM", hairline, Guests row "2 Adults"; buttons: black `CalendarBlank` icon + "ADD TO CALENDAR" → `/api/bookings/[ref]/ics`, ghost "RETURN TO DISCOVERY" → `/`.

`lookup/page.tsx`: form (ref + email) → server action query → same detail card (read-only); error state "No booking found for that reference and email."

Account claim (deferred wiring): when a GUEST user signs up/logs in, server action links `Guest.userId` where `email = user.email` — implement in `lib/guests.ts` + call from login success; `/account` lists their bookings (reuse detail card). Mark as phase-1-lite: include claim function + `/account` list only.

- [ ] **Step 4: Run test — PASS + build + render check**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: confirmed page, ics, lookup, account claim"
```

---

### Task 6: Mock payment provider + flow

**Files:**
- Create: `src/lib/payments/provider.ts`, `src/lib/payments/mock.ts`, `src/lib/payments/factory.ts`, `src/app/(guest)/pay/mock/[bookingRef]/page.tsx`, `src/app/api/payments/mock/callback/route.ts`, `tests/payments-mock.test.ts`

**Interfaces:**
- Produces: `PaymentProvider` interface (spec §5 FR-5), `MockPaymentProvider`, `getPaymentProvider()`; mock FPX page (bank picker list: Maybank2u, CIMB Clicks, Public Bank, Bank Islam + Pay Success/Pay Fail buttons) → callback marks Payment PAID/FAILED + Booking CONFIRMED on paid

- [ ] **Step 1: Write failing test**

`tests/payments-mock.test.ts`: mock db; `handleCallback({ reference, outcome: "success" })` → payment status PAID, booking CONFIRMED; `outcome: "fail"` → FAILED, booking stays PENDING; unknown reference → `{ status: "failed" }` without throwing.

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

Provider interface verbatim from spec. Mock: `createPayment` returns `/pay/mock/<bookingRef>`; page lists banks (Swiss list, hairline rows, radio-style) + two buttons (primary "Pay Success - RM X", ghost "Simulate Failure"); both POST callback → redirect `/book/confirmed?ref=` (success) or `/book/review?...&error=payment_failed` (fail — review page shows inline error banner per harden pattern). Callback route validates reference + outcome, updates in transaction.

Wire into Review ConfirmButton: after `createBooking`, if `PAYMENT_PROVIDER=mock` AND param `pay=now`, redirect to provider `redirectUrl` instead of straight to confirmed. Default button copy stays "CONFIRM BOOKING" (pay-later path per design "You won't be charged yet"); secondary link "Pay now online" under terms (LabelCaps style).

- [ ] **Step 4: Run test — PASS + build**

- [ ] **Step 5: Playwright E2E (booking flow)**

`e2e/booking.spec.ts`: home → Explore Villa → RESERVE NOW → pick range → continue → guests → details (fill Alexander Wright) → review (assert totals "RM 13,860.00" recomputed text present... use data-testid `total`) → CONFIRM BOOKING → confirmed page shows `#LS-` reference → ADD TO CALENDAR returns 200 `text/calendar`. Run: `npx playwright test`.

- [ ] **Step 6: Commit**

```bash
git add src tests e2e
git commit -m "feat: mock payment provider + booking e2e"
```

---

### Task 7: Admin shell + Overview

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/components/admin/SideNav.tsx`, `src/components/admin/TopBar.tsx`, `src/components/admin/KpiCard.tsx`, `src/components/admin/ActivityFeed.tsx`, `src/components/admin/BookingActivityChart.tsx`, `src/app/admin/page.tsx`, `src/lib/admin-metrics.ts`, `tests/admin-metrics.test.ts`

**Interfaces:**
- Produces: `getOverviewMetrics(): Promise<OverviewMetrics>` — `{ revenueYtd, revenueDeltaPct, occupancyPct, totalBookings, pendingCount, nextArrival: { guestName, property, guests, time } | null, activity30d: { date: string, count: number }[], recent: { icon, title, sub, ago }[] }` (fallback data offline)

- [ ] **Step 1: Write failing test**

`tests/admin-metrics.test.ts`: mock db aggregates → revenue sums PAID payments YTD; occupancy = booked nights/(active properties × days in month); nextArrival = today's earliest CONFIRMED check-in; DB error → fallback object with mockup values (RM 45,200 / 88% / 1,204 / 8 pending / Ahmad Aiman).

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

`admin/layout.tsx`: `requireAdmin()`; SideNav (240px, per mockup: brand block + black `+ Add New Booking` → `/admin/bookings/new` (stub page phase-1-lite: manual booking form minimal) + 7 nav items with phosphor icons + active pill + divider + Settings bottom; drawer on mobile with ×); TopBar (tabs Overview/Analytics/Operations — Analytics/Operations are `aria-disabled` stubs phase 2; search input decor; bell, `DotsNine`, `Question`, avatar).

Overview page: headline-md "Overview" + subcopy; KPI grid 3 KpiCard (LabelCaps label, display value mono-data 28px, subtext with `TrendUp`/`Clock` icons) + dark alert card (`bg-primary-container` white text: LabelCaps "⚠ IMPORTANT TODAY", "Guest Arrival", "Ahmad Aiman at The Pavilion", "2 Guests • 3:00 PM"); BookingActivityChart (CSS bar chart: 30 bars `surface-dim`, max bar `primary`, x labels "01 Oct / 15 Oct / 30 Oct", LabelCaps "VIEW FULL REPORT" link stub); Recent Activity feed (icon squares `surface-container`, divider rows, 3 items verbatim-ish from metrics).

- [ ] **Step 4: Run test — PASS + build + render check (`curl /admin` with session cookie or guard-bypass test env → assert KPI labels; verify redirect without session)**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: admin shell + overview dashboard"
```

---

### Task 8: Admin Bookings table

**Files:**
- Create: `src/app/admin/bookings/page.tsx`, `src/components/admin/BookingsTable.tsx`, `src/lib/admin-bookings.ts`, `tests/admin-bookings.test.ts`

**Interfaces:**
- Produces: `listBookings(query): Promise<{ rows: BookingRow[]; total: number }>` — filters `status`, `propertyId`, `from`, `to`, `search`, `page`, `pageSize=4`(mockup rhythm; make 10 default w/ test) ; BookingRow = `{ id, reference, guestName, propertyName, stayDates, amount, status }`

- [ ] **Step 1: Write failing test**

`tests/admin-bookings.test.ts`: mock db `findMany`/`count` → where clause includes status filter + OR search across reference/guest.name/property.name; pagination `skip/take` correct for page 3; amount formatted "RM 1,240" style via `formatMyr`; fallback rows (BK-1042..BK-1045 verbatim) when DB offline.

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

RSC page: search + filters as GET form (server round-trip, searchParams Promise); bulk toolbar client leaf (selection state; "0 selected" + Confirm/Message/Cancel disabled until selection; bulk confirm POSTs to `/api/admin/bookings/bulk` with `requireAdmin` + two-layer check). Table = TanStack in client leaf receiving rows via props: checkbox col, BOOKING ID (`mono-data` gray), GUEST, PROPERTY, STAY DATES ("Oct 12 - Oct 15"), AMOUNT right-aligned, STATUS Badge, `DotsThreeVertical` row menu (Confirm/Cancel/View). Pagination verbatim: "Showing 1 to 4 of 128 results" + Prev [1] 2 3 … 12 Next (active = filled black square).

- [ ] **Step 4: Run test — PASS + build**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: admin bookings table + bulk actions"
```

---

### Task 9: Admin Booking detail + mutations

**Files:**
- Create: `src/app/admin/bookings/[id]/page.tsx`, `src/app/api/admin/bookings/[id]/route.ts` (PATCH: confirm/cancel), `src/app/api/admin/bookings/[id]/payments/route.ts` (POST record payment), `src/app/api/admin/bookings/[id]/notes/route.ts` (POST note), `src/lib/admin-booking-detail.ts`, `tests/admin-booking-detail.test.ts`

**Interfaces:**
- Produces: `getBookingDetail(id)`, `confirmBooking(id)`, `cancelBooking(id)` (releases dates — status CANCELLED; availability auto-frees via engine), `recordPayment(id, { amount, method, note })`, `addNote(id, body, authorId)`

- [ ] **Step 1: Write failing test**

`tests/admin-booking-detail.test.ts`: confirm sets status CONFIRMED + writes timeline note; cancel sets CANCELLED and `isRangeBookable` for its range returns true after (mock); recordPayment creates PAID payment + booking status CONFIRMED when fully paid; addNote stores author + timestamp; unauthorized (no session) → 401/redirect (guard test per Plan 1 pattern).

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

Page per mockup: header "Booking LS-1042" + Badge + "Created on Aug 1, 2024 via Direct Website"; actions Print (ghost, `window.print()` client leaf) + Confirm Booking (primary, POST); grid 65/35: Guest Information card (avatar square, name, email, phone, "Returning Guest" with icon when ≥2 bookings; "Contact Guest" `mailto:` link) / Property card (image, name, location, capacity/beds rows) / Stay Details (Check-in bold date + time, "3 N" center indicator, Check-out; Occupancy; Special Requests) | right rail: Payment Summary (rows + Total + "Unpaid" `error` red when unpaid, "Record Payment" opens inline form: amount/method select/note), Internal Notes (gray note box + "Added by: Sarah L. (Aug 2)" + edit affordance adding new note), Cancel Booking (full-width `error-container` bg, `error` text, `Prohibit` icon, confirm dialog).

- [ ] **Step 4: Run test — PASS + build**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: admin booking detail + mutations"
```

---

### Task 10: Admin Availability Calendar

**Files:**
- Create: `src/app/admin/calendar/page.tsx`, `src/components/admin/AvailabilityCalendar.tsx`, `src/components/admin/QuickActions.tsx`, `src/app/api/admin/blocks/route.ts` (POST maintenance block), `tests/admin-calendar.test.ts`

**Interfaces:**
- Consumes: `getDateStates` (Task 1) per property or aggregate ("All Properties" = union: booked if ANY property booked; blocks shown per property filter)
- Produces: month grid with booking bars (guest label), hold/blocked states; "Set Maintenance Block" (property + range + label) API; "Export PDF Schedule" = print stylesheet view (phase-1-lite)

- [ ] **Step 1: Write failing test**

`tests/admin-calendar.test.ts`: `getAdminMonthMatrix(propertyId|"all", year, month)` → weeks array MON-first; cell states merge bookings (with label "Smith Family") + blocks; trailing prev-month days flagged `muted`.

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

Page: header "Availability Calendar" + subcopy; controls right: property dropdown (native `<select>` styled Swiss) + Month/Timeline segmented (Timeline stub `aria-disabled` phase 2); month nav `‹ JULY | August 2024 | SEPTEMBER ›`; legend row (4 swatches LabelCaps). Grid: MON–SUN LabelCaps gray band; cells min-h-[96px] 1px dividers; booking bars `bg-primary-container` white text 11px truncate; holds sage; blocked `surface-dim` + centered `Prohibit`; multi-day bars span via range-aware rendering (bar segment per cell with continuation styling). Weekly Utilization card (4 CSS bars W1–W4, computed booked-nights share) + Quick Actions card (2 ghost buttons with wrench/download icons; maintenance opens inline form → POST block).

- [ ] **Step 4: Run test — PASS + build**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: admin availability calendar + maintenance blocks"
```

---

### Task 11: Admin derived pages (Properties/Guests/Payments/Reviews/Settings) — lite

**Files:**
- Create: `src/app/admin/properties/page.tsx`, `src/app/admin/guests/page.tsx`, `src/app/admin/payments/page.tsx`, `src/app/admin/reviews/page.tsx`, `src/app/admin/settings/page.tsx`, `tests/admin-derived.test.ts`

**Interfaces:**
- Produces: list pages reusing Bookings table/sidebar patterns (spec §11): Properties (4 villas, active toggle only), Guests (list + booking count), Payments (list + status badges, filter), Reviews (approve/hide toggle), Settings (brand info read-only + users list)

- [ ] **Step 1: Write failing tests** — list functions return rows with fallback; review toggle flips `approved`; property toggle flips `isActive`.

- [ ] **Step 2: Run tests — FAIL → implement → PASS**

Keep each page ~80 lines: RSC fetch + client table leaf reuse (`BookingsTable` generalized into `DataTable` in this task — refactor Task 8 component to accept column defs; update Task 8 usage accordingly).

- [ ] **Step 3: Verify + Commit**

```bash
npm run typecheck && npm test && npm run build
git add src tests
git commit -m "feat: admin properties/guests/payments/reviews/settings (lite)"
```

---

### Task 12: Mobile admin + login + OG/sitemap + E2E + deploy prep

**Files:**
- Create: `src/app/(auth)/login/page.tsx`, `public/og.png` (script-generated), `scripts/gen-og.ts`, `src/app/icon.svg`, `e2e/admin.spec.ts`
- Modify: admin responsive (drawer), `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1: Login page** — Swiss card centered: wordmark, Input email/password, primary "Sign In", error inline; `authClient.signIn.email` → redirect `next` param; role-based landing (ADMIN/STAFF → `/admin`, GUEST → `/account`).

- [ ] **Step 2: Mobile admin pass** — 390px: hamburger + centered wordmark + avatar topbar; drawer SideNav with ×; Overview mobile per mockup (TODAY'S OVERVIEW eyebrow, REVENUE (MTD) card with +12% trend, BOOKINGS/OCCUPANCY stat cards with progress bar, Upcoming Check-ins rows with overflow buttons, Recent Activity vertical timeline). Verify via Playwright screenshots.

- [ ] **Step 3: OG + icons** — `scripts/gen-og.ts` (sharp): 1200×630 `primary` bg + "LUMASTAY" + "ARCHITECTURAL PERMANENCE." white text → `public/og.png`; `icon.svg` simple monogram; reference in root metadata. sitemap.ts: static routes + `/villas/[slug]` from DB (fallback list). robots.ts disallow `/admin`, `/api/`, `/account`.

- [ ] **Step 4: E2E admin** — `e2e/admin.spec.ts`: login as seeded admin → overview KPIs visible → bookings table → open BK → record payment → status PAID → calendar shows booking bar. Run: `npx playwright test`.

- [ ] **Step 5: Deploy prep** — `vercel link` + env vars documented in `.env.example`; build green; `docs/DEPLOY.md` notes (Supabase pooler URL pattern, IPv6 pitfall, seed command). Actual deploy executed with user approval.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: login, mobile admin, og/sitemap, admin e2e, deploy prep"
```

---

## Self-Review

**Spec coverage (Plan 3):** FR-1 booking flow (Tasks 2–5) · FR-2 availability (Tasks 1, 9, 10) · FR-3 admin ops (Tasks 7–11) · FR-4 SEO (Task 12) · FR-5 payments (Task 6) · §4.2 admin routes (Tasks 7–11) · §3.4 signatures 3, 4 (Tasks 2, 5) · §9 testing (Tasks 6, 12 E2E). Phase-2 items remain deferred per spec §10 (email, analytics tab, timeline view, auto-release cron, real gateway).

**Placeholder scan:** "Analytics/Operations tabs", "Timeline toggle", "VIEW FULL REPORT" are explicitly designed stubs matching mockups' forward references — each is `aria-disabled` with phase-2 note in code; not plan placeholders. Manual "Add New Booking" is phase-1-lite (minimal form), flagged in Task 7.

**Type consistency:** `DateState`, `PriceBreakdown`, `BookingParams`, `BookingRow`, `OverviewMetrics` defined once (Tasks 1/2/7/8) and consumed uniformly; `LS-` reference format consistent everywhere including ICS UID; `formatMyr` helper introduced Task 8 — note: earlier tasks format prices inline; Task 8 refactor consolidates into `lib/format.ts` (update Tasks 3–5 usages when landing Task 8).

**Execution order note:** Task 11's `DataTable` generalization refactors Task 8 output — acceptable within-plan evolution; keep both green.
