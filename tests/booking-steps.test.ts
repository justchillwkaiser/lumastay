import { describe, it, expect } from "vitest";
import { requireParamsFor, type BookingParams } from "@/lib/booking-params";

function params(overrides: Partial<BookingParams>): BookingParams {
  return {
    property: null,
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    name: null,
    email: null,
    phone: null,
    requests: null,
    ...overrides,
  };
}

describe("step guards", () => {
  it("guests requires dates", () => {
    expect(() => requireParamsFor("guests", params({ property: "p" }))).toThrow(
      "REDIRECT:/book/dates",
    );
  });
  it("details requires dates + guests", () => {
    expect(() =>
      requireParamsFor(
        "details",
        params({ property: "p", checkIn: "2024-10-12", checkOut: "2024-10-15" }),
      ),
    ).not.toThrow();
  });
});
