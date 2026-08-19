import { describe, it, expect, vi } from "vitest";

const { findMany, count } = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: { booking: { findMany, count } },
}));

describe("listBookings", () => {
  it("builds where clause with status filter + OR search", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    const { listBookings } = await import("@/lib/admin-bookings");
    await listBookings({ status: "CONFIRMED", search: "wright", page: 1 });
    const where = findMany.mock.calls[0][0].where;
    expect(where.status).toBe("CONFIRMED");
    expect(where.OR).toBeDefined();
    expect(where.OR.length).toBeGreaterThanOrEqual(3); // reference + guest.name + property.name
  });

  it("paginates with skip/take (page 3, pageSize 10)", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(128);
    const { listBookings } = await import("@/lib/admin-bookings");
    const res = await listBookings({ page: 3 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
    expect(res.total).toBe(128);
  });

  it("formats amount via formatMyr + stayDates range", async () => {
    findMany.mockResolvedValue([
      {
        id: "b1",
        reference: "LS-1042",
        checkIn: new Date("2024-10-12T00:00:00Z"),
        checkOut: new Date("2024-10-15T00:00:00Z"),
        totalAmount: 1240,
        status: "CONFIRMED",
        guest: { name: "Alexander Wright" },
        property: { shortName: "The Pavilion" },
      },
    ]);
    count.mockResolvedValue(1);
    const { listBookings } = await import("@/lib/admin-bookings");
    const res = await listBookings({ page: 1 });
    expect(res.rows[0].amount).toBe("RM 1,240");
    expect(res.rows[0].stayDates).toBe("Oct 12 - Oct 15");
    expect(res.rows[0].reference).toBe("LS-1042");
  });

  it("DB offline => fallback rows BK-1042..BK-1045", async () => {
    findMany.mockRejectedValue(new Error("ECONNREFUSED"));
    count.mockRejectedValue(new Error("ECONNREFUSED"));
    const { listBookings } = await import("@/lib/admin-bookings");
    const res = await listBookings({ page: 1 });
    expect(res.rows[0].reference).toBe("BK-1042");
    expect(res.rows[3].reference).toBe("BK-1045");
    expect(res.total).toBe(128);
  });
});
