import { NextResponse } from "next/server";

import { addNote } from "@/lib/admin-booking-detail";
import { requireAdmin } from "@/lib/guards";

// POST /api/admin/bookings/[id]/notes — internal timeline note.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  const { id } = await params;

  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (typeof body.body !== "string" || body.body.trim() === "") {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await addNote(id, body.body.trim(), session.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
