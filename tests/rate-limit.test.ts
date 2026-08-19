import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      const r = rateLimit(key, { limit: 5, windowMs: 60_000 });
      expect(r.success).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const key = `test:${Math.random()}`;
    // 5 dibenarkan
    for (let i = 0; i < 5; i++) {
      rateLimit(key, { limit: 5, windowMs: 60_000 });
    }
    // Ke-6 ditolak
    const r = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(r.success).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("tracks remaining correctly", () => {
    const key = `test:${Math.random()}`;
    const r1 = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(r1.remaining).toBe(4);
    const r2 = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(r2.remaining).toBe(3);
  });

  it("resets after the window expires", async () => {
    const key = `test:${Math.random()}`;
    // Limit 1, window 50ms
    expect(rateLimit(key, { limit: 1, windowMs: 50 }).success).toBe(true);
    expect(rateLimit(key, { limit: 1, windowMs: 50 }).success).toBe(false);
    // Tunggu window tamat
    await new Promise((r) => setTimeout(r, 60));
    expect(rateLimit(key, { limit: 1, windowMs: 50 }).success).toBe(true);
  });

  it("different keys have independent counters", () => {
    const a = `test:a:${Math.random()}`;
    const b = `test:b:${Math.random()}`;
    rateLimit(a, { limit: 1, windowMs: 60_000 });
    expect(rateLimit(a, { limit: 1, windowMs: 60_000 }).success).toBe(false);
    expect(rateLimit(b, { limit: 1, windowMs: 60_000 }).success).toBe(true);
  });
});
