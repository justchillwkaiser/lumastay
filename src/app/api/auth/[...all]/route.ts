import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const handler = toNextJsHandler(auth);

export const { GET } = handler;

// Auth endpoints (sign-in, sign-up) — brute-force protection.
// 5 attempts per 5 minutes per IP.
export async function POST(request: Request) {
  const rl = rateLimit(`auth:${clientIp(request)}`, {
    limit: 5,
    windowMs: 5 * 60_000,
  });
  if (!rl.success) return rateLimitResponse(rl);
  return handler.POST(request);
}
