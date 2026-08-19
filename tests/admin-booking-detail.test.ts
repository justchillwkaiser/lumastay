import { describe, it, expect, vi } from "vitest";

const {
  bookingFindUnique,
  bookingUpdate,
  paymentCreate,
  paymentAggregate,
  noteCreate,
  tx,
  bookable,
} = vi.hoisted(() => ({
  bookingFindUnique: vi.fn(),
  bookingUpdate: vi.fn(),
  paymentCreate: vi.fn(),
  paymentAggregate: vi.fn(),
  noteCreate: vi.fn(),
  tx: vi.fn(),
  bookable: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    booking: { findUnique: bookingFindUnique, update: bookingUpdate },
    payment: { create: paymentCreate, aggregate: paymentAggregate },
    internalNote: { create: noteCreate },
    $transaction: tx,
  },
}));
vi.mock("@/lib/availability", () => ({ isRangeBookable: bookable }));

const bookingRow = {
  id: "b1",
  reference: "LS-1042",
  status: "PENDING",
  checkIn: new Date("2024-10-24T00:00:00Z"),
  checkOut: new Date("2024-10-28T00:00:00Z"),
  totalAmount: 13860,
  propertyId: "p1",
  guest: { name: "Alexander Wright", email: "a.wright@example.com", phone: "+60 12 345 6789" },
  property: { shortName: "The Pavilion", checkInTime: "3:00 PM", checkOutTime: "12:00 PM" },
  payments: [],
  notes: [],
};

describe("admin booking detail mutations", () => {
  it("confirmBooking sets status CONFIRMED + writes timeline note", async () => {
    bookingFindUnique.mockResolvedValue(bookingRow);
    tx.mockImplementation(async (fn: any) => fn({
      booking: { update: bookingUpdate },
      internalNote: { create: noteCreate },
    }));
    const { confirmBooking } = await import("@/lib/admin-booking-detail");
    await confirmBooking("b1", "admin-1");
    expect(bookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "CONFIRMED" }) }),
    );
    expect(noteCreate).toHaveBeenCalled();
  });

  it("cancelBooking sets CANCELLED and range becomes bookable", async () => {
    bookingFindUnique.mockResolvedValue(bookingRow);
    tx.mockImplementation(async (fn: any) => fn({
      booking: { update: bookingUpdate },
      internalNote: { create: noteCreate },
    }));
    bookable.mockResolvedValue(true);
    const { cancelBooking } = await import("@/lib/admin-booking-detail");
    const { isRangeBookable } = await import("@/lib/availability");
    await cancelBooking("b1", "admin-1");
    expect(bookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "CANCELLED" }) }),
    );
    expect(await isRangeBookable("p1", "2024-10-24", "2024-10-28")).toBe(true);
  });

  it("recordPayment creates PAID payment + CONFIRMED when fully paid", async () => {
    bookingFindUnique.mockResolvedValue(bookingRow);
    paymentAggregate.mockResolvedValue({ _sum: { amount: 13860 } });
    tx.mockImplementation(async (fn: any) => fn({
      payment: { create: paymentCreate, aggregate: paymentAggregate },
      booking: { update: bookingUpdate },
      internalNote: { create: noteCreate },
    }));
    const { recordPayment } = await import("@/lib/admin-booking-detail");
    await recordPayment("b1", { amount: "13860.00", method: "bank-transfer", note: "full" }, "admin-1");
    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "PAID" }) }),
    );
    expect(bookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "CONFIRMED" }) }),
    );
  });

  it("addNote stores author + timestamp", async () => {
    noteCreate.mockResolvedValue({ id: "n1" });
    const { addNote } = await import("@/lib/admin-booking-detail");
    await addNote("b1", "Guest requested late checkout", "admin-1");
    expect(noteCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bookingId: "b1", authorId: "admin-1", body: "Guest requested late checkout" }),
      }),
    );
  });
});
