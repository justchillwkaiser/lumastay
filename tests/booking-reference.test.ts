import { describe, it, expect, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { $queryRaw: queryRaw },
}));

describe("nextBookingReference", () => {
  it("returns LS-#### from Postgres sequence", async () => {
    queryRaw.mockResolvedValue([{ nextval: BigInt(1042) }]);
    const { nextBookingReference } = await import("@/lib/booking-reference");
    expect(await nextBookingReference()).toBe("LS-1042");
  });
  it("format is LS- + zero-padded >= 4 digits", async () => {
    queryRaw.mockResolvedValue([{ nextval: BigInt(1024) }]);
    const { nextBookingReference } = await import("@/lib/booking-reference");
    const ref = await nextBookingReference();
    expect(ref).toMatch(/^LS-\d{4,}$/);
  });
  it("pads small sequence values to 4 digits", async () => {
    queryRaw.mockResolvedValue([{ nextval: BigInt(7) }]);
    const { nextBookingReference } = await import("@/lib/booking-reference");
    expect(await nextBookingReference()).toBe("LS-0007");
  });
});
