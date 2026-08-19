import { NextResponse } from "next/server";

import { createBooking } from "@/lib/bookings";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/bookings — plan 3 task 4. The route is a thin shell: all
// validation, availability re-check, and server-side pricing live in
// createBooking. 400 on { error }. Rate limit: 5 bookings/min per IP.
export async function POST(request: Request) {
  const rl = rateLimit(`bookings:${clientIp(request)}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!rl.success) return rateLimitResponse(rl);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  // Numbers arrive as strings from the URL-carried flow — coerce lightly.
  const raw = body as Record<string, unknown>;
  const input = {
    ...raw,
    adults: Number(raw.adults),
    children: Number(raw.children ?? 0),
  };

  const result = await createBooking(input as Record<string, unknown>);
  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
