import { describe, it, expect } from "vitest";
import { computePrice } from "@/lib/pricing";

const pavilion = { nightlyRate: "3200.00", cleaningFee: "400.00", serviceFeePct: "5.0", taxPct: "0" };

describe("computePrice", () => {
  it("replicates review-page math (4 nights)", () => {
    const p = computePrice(pavilion, 4);
    expect(p.subtotal).toBe("12800.00");
    expect(p.cleaningFee).toBe("400.00");
    expect(p.serviceFee).toBe("660.00"); // 5% of (subtotal + cleaning)
    expect(p.total).toBe("13860.00");
  });
  it("1 night minimum math", () => {
    const p = computePrice(pavilion, 1);
    expect(p.subtotal).toBe("3200.00");
    expect(p.total).toBe("3780.00"); // 3200 + 400 + 180
  });
  it("zero nights throws", () => {
    expect(() => computePrice(pavilion, 0)).toThrow();
  });
});
