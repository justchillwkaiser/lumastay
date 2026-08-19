import { NextResponse } from "next/server";

import { togglePropertyActive } from "@/lib/admin-derived";
import { requireAdmin } from "@/lib/guards";

// PATCH /api/admin/properties/[id] — { isActive: boolean }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  let body: { isActive?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await togglePropertyActive(id, body.isActive);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
