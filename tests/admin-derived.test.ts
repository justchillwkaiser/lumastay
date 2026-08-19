import { describe, it, expect, vi } from "vitest";

const {
  propertyFindMany,
  propertyUpdate,
  guestFindMany,
  paymentFindMany,
  reviewFindMany,
  reviewUpdate,
  userFindMany,
} = vi.hoisted(() => ({
  propertyFindMany: vi.fn(),
  propertyUpdate: vi.fn(),
  guestFindMany: vi.fn(),
  paymentFindMany: vi.fn(),
  reviewFindMany: vi.fn(),
  reviewUpdate: vi.fn(),
  userFindMany: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    property: { findMany: propertyFindMany, update: propertyUpdate },
    guest: { findMany: guestFindMany },
    payment: { findMany: paymentFindMany },
    review: { findMany: reviewFindMany, update: reviewUpdate },
    user: { findMany: userFindMany },
  },
}));

describe("admin derived lists", () => {
  it("listAdminProperties returns rows with isActive", async () => {
    propertyFindMany.mockResolvedValue([
      { id: "p1", name: "The Pavilion at Hulu Langat", shortName: "The Pavilion", locationLine: "Hulu Langat", nightlyRate: 3200, isActive: true, _count: { bookings: 5 } },
    ]);
    const { listAdminProperties } = await import("@/lib/admin-derived");
    const rows = await listAdminProperties();
    expect(rows[0].isActive).toBe(true);
    expect(rows[0].bookingCount).toBe(5);
  });

  it("togglePropertyActive flips isActive", async () => {
    propertyUpdate.mockResolvedValue({ id: "p1", isActive: false });
    const { togglePropertyActive } = await import("@/lib/admin-derived");
    await togglePropertyActive("p1", false);
    expect(propertyUpdate).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { isActive: false },
    });
  });

  it("listAdminGuests returns guests with booking counts", async () => {
    guestFindMany.mockResolvedValue([
      { id: "g1", name: "Alexander Wright", email: "a@x.com", phone: "+60 12", _count: { bookings: 3 } },
    ]);
    const { listAdminGuests } = await import("@/lib/admin-derived");
    const rows = await listAdminGuests();
    expect(rows[0].bookingCount).toBe(3);
  });

  it("listAdminPayments filters by status", async () => {
    paymentFindMany.mockResolvedValue([]);
    const { listAdminPayments } = await import("@/lib/admin-derived");
    await listAdminPayments({ status: "PAID" });
    expect(paymentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: "PAID" }) }),
    );
  });

  it("toggleReviewApproved flips approved", async () => {
    reviewUpdate.mockResolvedValue({ id: "r1", approved: true });
    const { toggleReviewApproved } = await import("@/lib/admin-derived");
    await toggleReviewApproved("r1", true);
    expect(reviewUpdate).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { approved: true },
    });
  });

  it("offline => empty fallback rows (never throws)", async () => {
    propertyFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    guestFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    paymentFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    reviewFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    userFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    const { listAdminProperties, listAdminGuests, listAdminPayments, listAdminReviews, listAdminUsers } =
      await import("@/lib/admin-derived");
    expect(await listAdminProperties()).toEqual([]);
    expect(await listAdminGuests()).toEqual([]);
    expect(await listAdminPayments()).toEqual([]);
    expect(await listAdminReviews()).toEqual([]);
    expect(await listAdminUsers()).toEqual([]);
  });
});
