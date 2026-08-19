import { NextResponse } from "next/server";

import { getPaymentProvider } from "@/lib/payments/factory";

// POST /api/payments/mock/callback — plan 3 task 6. Validates reference +
// outcome, updates Payment (PAID/FAILED) + Booking (CONFIRMED on paid) in a
// transaction via the provider.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const result = await provider.handleCallback(body);
  return NextResponse.json(result, {
    status: result.status === "paid" || result.reference ? 200 : 400,
  });
}
