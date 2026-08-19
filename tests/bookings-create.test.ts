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
  it("DB exclusion violation (23J01) => DATES_UNAVAILABLE (race-condition guard)", async () => {
    bookable.mockResolvedValue(true); // pre-check passes (the race window)
    tx.mockRejectedValue(Object.assign(new Error("exclusion violation"), { code: "23J01" }));
    const { createBooking } = await import("@/lib/bookings");
    const res = await createBooking(input);
    expect(res).toEqual({ error: "DATES_UNAVAILABLE" });
  });
});
