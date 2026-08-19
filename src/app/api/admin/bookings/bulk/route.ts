import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

// POST /api/admin/bookings/bulk — plan 3 task 8. Two-layer guard:
// proxy matcher + requireAdmin() here.
export async function POST(request: Request) {
  await requireAdmin();

  let body: { ids?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((i) => typeof i === "string") : [];
  const action = body.action;
  if (ids.length === 0 || (action !== "confirm" && action !== "cancel")) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const status = action === "confirm" ? "CONFIRMED" : "CANCELLED";
  try {
    const result = await db.booking.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return NextResponse.json({ updated: result.count });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
