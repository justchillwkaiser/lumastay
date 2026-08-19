// MockPaymentProvider — plan 3 task 6. FPX-style internal bank picker;
// success/fail buttons POST to /api/payments/mock/callback, which updates
// Payment + Booking in a transaction.

import { db } from "@/lib/db";
import type {
  PaymentProvider,
  PaymentProviderBooking,
} from "@/lib/payments/provider";

interface MockCallbackPayload {
  reference?: unknown;
  outcome?: unknown;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(booking: PaymentProviderBooking) {
    return {
      redirectUrl: `/pay/mock/${booking.reference}`,
      reference: booking.reference,
    };
  }

  async handleCallback(payload: unknown) {
    const { reference, outcome } = (payload ?? {}) as MockCallbackPayload;
    if (typeof reference !== "string" || reference === "") {
      return { status: "failed" as const, reference: "" };
    }

    if (outcome === "success") {
      return await db.$transaction(async (tx) => {
        const payment = await tx.payment.updateMany({
          where: { booking: { reference } },
          data: { status: "PAID", paidAt: new Date() },
        });
        if (payment.count === 0) {
          return { status: "failed" as const, reference };
        }
        await tx.booking.updateMany({
          where: { reference },
          data: { status: "CONFIRMED" },
        });
        return { status: "paid" as const, reference };
      });
    }

    const payment = await db.payment.updateMany({
      where: { booking: { reference } },
      data: { status: "FAILED" },
    });
    if (payment.count === 0) {
      return { status: "failed" as const, reference };
    }
    return { status: "failed" as const, reference };
  }

  async verify(reference: string) {
    try {
      const payment = await db.payment.findFirst({
        where: { booking: { reference } },
        orderBy: { createdAt: "desc" },
      });
      if (!payment) return "pending";
      if (payment.status === "PAID") return "paid";
      if (payment.status === "FAILED") return "failed";
      return "pending";
    } catch {
      return "pending"; // offline — never throw from verify
    }
  }
}
