import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/admin/blocks — maintenance block (plan 3 task 10).
export async function POST(request: Request) {
  await requireAdmin();

  let body: { propertyId?: unknown; startDate?: unknown; endDate?: unknown; label?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { propertyId, startDate, endDate, label } = body;
  if (
    typeof propertyId !== "string" ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !DATE_RE.test(startDate) ||
    !DATE_RE.test(endDate) ||
    startDate >= endDate
  ) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await db.availabilityBlock.create({
      data: {
        propertyId,
        startDate: new Date(`${startDate}T00:00:00Z`),
        endDate: new Date(`${endDate}T00:00:00Z`),
        type: "BLOCKED",
        label: typeof label === "string" && label.trim() ? label.trim() : null,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
