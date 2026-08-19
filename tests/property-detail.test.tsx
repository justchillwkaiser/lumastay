import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { getPropertyBySlug } from "@/lib/properties";
import { BookingCard } from "@/components/guest/BookingCard";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("property detail", () => {
  it("getPropertyBySlug returns pavilion with specs + amenities", async () => {
    const p = await getPropertyBySlug("the-pavilion");
    expect(p?.name).toBe("The Pavilion at Hulu Langat");
    expect(p?.specs.map((s) => s.label)).toContain("TOTAL AREA");
    expect(p?.amenities.map((a) => a.label)).toContain("Infinity Pool");
  });
  it("returns null for unknown slug", async () => {
    expect(await getPropertyBySlug("nope")).toBeNull();
  });
  it("booking card shows nightly rate + reserve CTA link", () => {
    render(<BookingCard property={fallbackProperties[0]} />);
    expect(screen.getByText(/RM 3,200/)).toBeTruthy();
    expect(screen.getByText("/ night")).toBeTruthy();
    expect(screen.getByText("You won't be charged yet")).toBeTruthy();
    const cta = screen.getByRole("link", { name: /^reserve now$/i });
    expect(cta.getAttribute("href")).toContain("/book/dates");
    expect(cta.className).toContain("bg-primary");
  });
});
