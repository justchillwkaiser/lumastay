// Rate limiting — in-memory sliding window.
//
// Konsep: setiap key (biasanya IP) ada counter yang reset selepas tempoh
// tertentu. Kalau counter melebihi limit dalam window, request ditolak.
//
// Analogi: kaunter tiket — "maksimum 5 tiket per minit". Lepas 5, tunggu
// minit seterusnya.
//
// NOTA: In-memory = state hilang bila server restart, dan tak shared antara
// multiple serverless instances (Vercel). Untuk production, upgrade ke
// Upstash Redis. Tapi untuk belajar konsep + dev, ini cukup.

interface Window {
  count: number;
  resetAt: number; // epoch ms bila window reset
}

const store = new Map<string, Window>();

// Bersihkan window lama secara berkala supaya Map tak membesar tanpa had.
// (Simple leak prevention — setiap 1000 request, buang window tamat.)
let requestCount = 0;
const CLEANUP_EVERY = 1000;

function cleanup(now: number) {
  if (++requestCount % CLEANUP_EVERY !== 0) return;
  for (const [key, win] of store) {
    if (now >= win.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  limit: number; // maksimum request dalam window
  windowMs: number; // tempoh window dalam ms
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
}

/**
 * Semak dan increment counter untuk key.
 *
 * @param key - Unik identifier (contoh: `bookings:203.0.113.1`)
 * @param config - limit + windowMs
 * @returns success=false kalau kena limit
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const win = store.get(key);

  // Window tamat atau belum wujud → mulakan window baru
  if (!win || now >= win.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Window aktif — semak limit
  if (win.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: win.resetAt,
    };
  }

  win.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - win.count,
    resetAt: win.resetAt,
  };
}

/**
 * Helper: dapatkan IP client dari request (Vercel/proxy-aware).
 */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Helper: bina 429 response dengan standard rate-limit headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { error: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
      },
    },
  );
}
