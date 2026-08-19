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
