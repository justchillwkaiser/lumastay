import { describe, it, expect, vi } from "vitest";

const { paymentUpdateMany, bookingUpdateMany, tx } = vi.hoisted(() => ({
  paymentUpdateMany: vi.fn(),
  bookingUpdateMany: vi.fn(),
  tx: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    payment: { updateMany: paymentUpdateMany },
    booking: { updateMany: bookingUpdateMany },
    $transaction: tx,
  },
}));

describe("MockPaymentProvider.handleCallback", () => {
  it("success => payment PAID + booking CONFIRMED", async () => {
    paymentUpdateMany.mockResolvedValue({ count: 1 });
    tx.mockImplementation(async (fn: any) => fn({
      payment: { updateMany: paymentUpdateMany },
      booking: { updateMany: bookingUpdateMany },
    }));
    const { MockPaymentProvider } = await import("@/lib/payments/mock");
    const provider = new MockPaymentProvider();
    const res = await provider.handleCallback({ reference: "LS-1024", outcome: "success" });
    expect(res).toEqual({ status: "paid", reference: "LS-1024" });
    expect(paymentUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "PAID" }) }),
    );
    expect(bookingUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "CONFIRMED" }) }),
    );
  });

  it("fail => payment FAILED, booking stays PENDING", async () => {
    paymentUpdateMany.mockResolvedValue({ count: 1 });
    bookingUpdateMany.mockClear();
    tx.mockImplementation(async (fn: any) => fn({
      payment: { updateMany: paymentUpdateMany },
      booking: { updateMany: bookingUpdateMany },
    }));
    const { MockPaymentProvider } = await import("@/lib/payments/mock");
    const provider = new MockPaymentProvider();
    const res = await provider.handleCallback({ reference: "LS-1024", outcome: "fail" });
    expect(res).toEqual({ status: "failed", reference: "LS-1024" });
    expect(paymentUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) }),
    );
    expect(bookingUpdateMany).not.toHaveBeenCalled();
  });

  it("unknown reference => { status: 'failed' } without throwing", async () => {
    paymentUpdateMany.mockResolvedValue({ count: 0 });
    tx.mockImplementation(async (fn: any) => fn({
      payment: { updateMany: paymentUpdateMany },
      booking: { updateMany: bookingUpdateMany },
    }));
    const { MockPaymentProvider } = await import("@/lib/payments/mock");
    const provider = new MockPaymentProvider();
    const res = await provider.handleCallback({ reference: "LS-9999", outcome: "success" });
    expect(res).toEqual({ status: "failed", reference: "LS-9999" });
  });
});
