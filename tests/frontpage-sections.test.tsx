import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TheCollection } from "@/components/guest/TheCollection";
import { CuratedExperiences } from "@/components/guest/CuratedExperiences";
import { PressQuote } from "@/components/guest/PressQuote";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("the collection", () => {
  it("renders 3 villa cards with names, prices, meta", () => {
    render(<TheCollection properties={fallbackProperties.slice(1)} />);
    expect(screen.getByText("The Collection")).toBeTruthy();
    expect(screen.getByText("02 / DISCOVER")).toBeTruthy();
    expect(screen.getByText("Courtyard House")).toBeTruthy();
    expect(screen.getByText(/RM 950\+/)).toBeTruthy();
    expect(screen.getByText("Janda Baik, Pahang")).toBeTruthy();
    expect(screen.getByText("2 Beds")).toBeTruthy();
    expect(screen.getByText("Limestone Retreat")).toBeTruthy();
    expect(screen.getByText("The Horizon Villa")).toBeTruthy();
    expect(screen.getByRole("link", { name: "View Full Collection" })).toBeTruthy();
  });
});

describe("curated experiences", () => {
  it("renders 4 amenity cells with verbatim copy", () => {
    render(<CuratedExperiences />);
    expect(screen.getByText("Curated Experiences")).toBeTruthy();
    expect(screen.getByText(/Every detail engineered for profound relaxation/)).toBeTruthy();
    for (const l of ["Private Pools", "Organic Kitchen", "Discrete Concierge", "In-Villa Spa"])
      expect(screen.getByText(l)).toBeTruthy();
    expect(screen.getByText(/Anticipatory service ensuring total privacy/)).toBeTruthy();
  });
});

describe("press quote", () => {
  it("renders verbatim quote + attribution on dark band", () => {
    render(<PressQuote />);
    expect(screen.getByText(/masterclass in restraint/)).toBeTruthy();
    expect(screen.getByText("Monocle Magazine")).toBeTruthy();
    expect(screen.getByText("Travel Issue, 2024")).toBeTruthy();
  });
});
