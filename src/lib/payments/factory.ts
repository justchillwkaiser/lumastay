// Payment provider factory — spec FR-5: getPaymentProvider() via env
// PAYMENT_PROVIDER=mock|toyyibpay|billplz. Only `mock` exists in phase 1;
// unknown values fall back to mock so a misconfigured env never breaks the
// booking flow.

import { MockPaymentProvider } from "@/lib/payments/mock";
import type { PaymentProvider } from "@/lib/payments/provider";

export function getPaymentProvider(): PaymentProvider {
  // Phase 1: mock only. toyyibpay/billplz land when the real gateways are
  // integrated (spec §10 phase 2).
  return new MockPaymentProvider();
}
