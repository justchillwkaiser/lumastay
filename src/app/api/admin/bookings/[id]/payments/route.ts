import { NextResponse } from "next/server";

import { recordPayment } from "@/lib/admin-booking-detail";
import { requireAdmin } from "@/lib/guards";

// POST /api/admin/bookings/[id]/payments — manual "Record Payment"
// (spec FR-5: bypasses the provider; method bank-transfer/cash/other).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  const { id } = await params;

  let body: { amount?: unknown; method?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (typeof body.amount !== "string" || typeof body.method !== "string") {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await recordPayment(
      id,
      {
        amount: body.amount,
        method: body.method,
        note: typeof body.note === "string" ? body.note : undefined,
      },
      session.user.id,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
