// PaymentProvider abstraction — spec §5 FR-5 (verbatim).
// Manual admin "Record Payment" bypasses the provider entirely.

export interface PaymentProviderBooking {
  reference: string;
  totalAmount: string;
}

export interface PaymentProvider {
  createPayment(
    booking: PaymentProviderBooking,
  ): Promise<{ redirectUrl: string; reference: string }>;
  handleCallback(
    payload: unknown,
  ): Promise<{ status: "paid" | "failed"; reference: string }>;
  verify(reference: string): Promise<"paid" | "failed" | "pending">;
}
