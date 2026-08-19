import { NextResponse } from "next/server";

import { cancelBooking, confirmBooking } from "@/lib/admin-booking-detail";
import { requireAdmin } from "@/lib/guards";

// PATCH /api/admin/bookings/[id] — plan 3 task 9. Two-layer guard.
// Body: { action: "confirm" | "cancel" }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  const { id } = await params;

  let body: { action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  try {
    if (body.action === "confirm") {
      await confirmBooking(id, session.user.id);
    } else if (body.action === "cancel") {
      await cancelBooking(id, session.user.id);
    } else {
      return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
