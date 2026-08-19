import { describe, it, expect } from "vitest";
import { fallbackProperties, getPropertyBySlugFallback } from "@/lib/seed-fallback";

describe("seed fallback", () => {
  it("has all 4 villas in mockup order", () => {
    expect(fallbackProperties.map(p => p.slug)).toEqual([
      "the-pavilion", "courtyard-house", "limestone-retreat", "the-horizon-villa",
    ]);
  });
  it("pavilion matches mockup facts", () => {
    const p = getPropertyBySlugFallback("the-pavilion")!;
    expect(p.name).toBe("The Pavilion at Hulu Langat");
    expect(p.nightlyRate).toBe("3200.00");
    expect(p.maxGuests).toBe(8);
    expect(p.baths).toBe("4.5");
    expect(p.areaSqft).toBe(4500);
    expect(p.amenities).toHaveLength(6);
    expect(p.locationLine).toContain("Hulu Langat");
  });
  it("returns undefined for unknown slug", () => {
    expect(getPropertyBySlugFallback("nope")).toBeUndefined();
  });
});
