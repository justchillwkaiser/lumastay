import { describe, it, expect } from "vitest";
import { parseBookingParams } from "@/lib/booking-params";

describe("parseBookingParams", () => {
  it("parses valid params", () => {
    const p = parseBookingParams(new URLSearchParams("property=the-pavilion&checkIn=2024-10-12&checkOut=2024-10-15&adults=2&children=1"));
    expect(p).toEqual({ property: "the-pavilion", checkIn: "2024-10-12", checkOut: "2024-10-15", adults: 2, children: 1, name: null, email: null, phone: null, requests: null });
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
  it("parses contact fields carried as URL params (task 3)", () => {
    const p = parseBookingParams(new URLSearchParams(
      "property=the-pavilion&checkIn=2024-10-12&checkOut=2024-10-15&name=Ahmad+Faiz&email=faiz%40example.com&phone=%2B60+12+345+6789&requests=Late+check-in",
    ));
    expect(p.name).toBe("Ahmad Faiz");
    expect(p.email).toBe("faiz@example.com");
    expect(p.phone).toBe("+60 12 345 6789");
    expect(p.requests).toBe("Late check-in");
  });
  it("contact fields default to null", () => {
    const p = parseBookingParams(new URLSearchParams("property=x"));
    expect(p.name).toBeNull();
    expect(p.email).toBeNull();
    expect(p.phone).toBeNull();
    expect(p.requests).toBeNull();
  });
});
