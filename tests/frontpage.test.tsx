import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Hero } from "@/components/guest/Hero";
import { FeaturedSanctuary } from "@/components/guest/FeaturedSanctuary";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("hero", () => {
  it("renders verbatim 3-line headline with faded third line", () => {
    render(<Hero />);
    expect(screen.getByText("Architectural")).toBeTruthy();
    expect(screen.getByText("Permanence.")).toBeTruthy();
    const line3 = screen.getByText("Natural Serenity.");
    expect(line3.className).toMatch(/opacity-50|text-primary-fixed-dim/);
  });
  it("renders subcopy + underline text-link CTA", () => {
    render(<Hero />);
    expect(screen.getByText(/curated collection of minimalist sanctuaries/)).toBeTruthy();
    const cta = screen.getByRole("link", { name: /Discover Our Villas/ });
    expect(cta.className).toContain("underline");
  });
});

describe("featured sanctuary", () => {
  it("renders pavilion card with verbatim copy + price", () => {
    render(<FeaturedSanctuary property={fallbackProperties[0]} />);
    expect(screen.getByText(/The Pavilion at Hulu/)).toBeTruthy();
    expect(screen.getByText("Featured Sanctuary")).toBeTruthy();
    expect(screen.getByText("01 / SPOTLIGHT")).toBeTruthy();
    expect(screen.getByText(/RM 3,200/)).toBeTruthy();
    expect(screen.getByText(/architectural marvel suspended above/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore Villa" })).toBeTruthy();
  });
});
