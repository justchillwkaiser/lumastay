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
