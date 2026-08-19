import { describe, it, expect, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); },
}));

describe("guards", () => {
  it("requireAdmin redirects guests to /login", async () => {
    getSession.mockResolvedValue(null);
    const { requireAdmin } = await import("@/lib/guards");
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });
  it("requireAdmin rejects non-admin roles", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "GUEST" } });
    const { requireAdmin } = await import("@/lib/guards");
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });
  it("requireAdmin returns session for ADMIN", async () => {
    const session = { user: { id: "a1", role: "ADMIN" } };
    getSession.mockResolvedValue(session);
    const { requireAdmin } = await import("@/lib/guards");
    await expect(requireAdmin()).resolves.toEqual(session);
  });
});
