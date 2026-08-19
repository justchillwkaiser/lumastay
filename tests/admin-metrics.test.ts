import { describe, it, expect, vi } from "vitest";

const { paymentAggregate, bookingCount, bookingFindMany, propertyCount } =
  vi.hoisted(() => ({
    paymentAggregate: vi.fn(),
    bookingCount: vi.fn(),
    bookingFindMany: vi.fn(),
    propertyCount: vi.fn(),
  }));
vi.mock("@/lib/db", () => ({
  db: {
    payment: { aggregate: paymentAggregate },
    booking: { count: bookingCount, findMany: bookingFindMany },
    property: { count: propertyCount },
  },
}));

describe("getOverviewMetrics", () => {
  it("aggregates revenue/occupancy/bookings from db", async () => {
    paymentAggregate.mockResolvedValue({ _sum: { amount: 45200 } });
    bookingCount.mockResolvedValue(1204);
    propertyCount.mockResolvedValue(4);
    bookingFindMany.mockResolvedValue([
      {
        checkIn: new Date(), // today => nextArrival candidate
        guest: { name: "Ahmad Aiman" },
        property: { shortName: "The Pavilion", checkInTime: "3:00 PM" },
        adults: 2,
        children: 0,
        nights: 3,
      },
    ]);
    const { getOverviewMetrics } = await import("@/lib/admin-metrics");
    const m = await getOverviewMetrics();
    expect(m.revenueYtd).toBe("45200.00");
    expect(m.totalBookings).toBe(1204);
    expect(m.nextArrival?.guestName).toBe("Ahmad Aiman");
  });

  it("DB error => fallback object with mockup values", async () => {
    paymentAggregate.mockRejectedValue(new Error("ECONNREFUSED"));
    bookingCount.mockRejectedValue(new Error("ECONNREFUSED"));
    propertyCount.mockRejectedValue(new Error("ECONNREFUSED"));
    bookingFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    const { getOverviewMetrics } = await import("@/lib/admin-metrics");
    const m = await getOverviewMetrics();
    expect(m.revenueYtd).toBe("45200.00");
    expect(m.occupancyPct).toBe(88);
    expect(m.totalBookings).toBe(1204);
    expect(m.pendingCount).toBe(8);
    expect(m.nextArrival?.guestName).toBe("Ahmad Aiman");
  });
});
