import { NextResponse } from "next/server";

import { toggleReviewApproved } from "@/lib/admin-derived";
import { requireAdmin } from "@/lib/guards";

// PATCH /api/admin/reviews/[id] — { approved: boolean }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  let body: { approved?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await toggleReviewApproved(id, body.approved);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
