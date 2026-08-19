import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AmenitiesGrid } from "@/components/guest/AmenitiesGrid";
import { SpecsTable } from "@/components/guest/SpecsTable";
import { listApprovedReviews } from "@/lib/reviews";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("amenities + specs", () => {
  it("renders 6 amenities in 2x3 grid", () => {
    render(<AmenitiesGrid amenities={fallbackProperties[0].amenities} />);
    expect(screen.getByText("What this place offers")).toBeTruthy();
    for (const a of ["Infinity Pool", "High-speed Wi-Fi", "Chef's Kitchen",
      "Private Parking", "Central Air Conditioning", "Media Room"])
      expect(screen.getByText(a)).toBeTruthy();
  });
  it("specs table renders verbatim label/value pairs", () => {
    render(<SpecsTable specs={fallbackProperties[0].specs} />);
    expect(screen.getByText("Property Specifications")).toBeTruthy();
    expect(screen.getByText("TOTAL AREA")).toBeTruthy();
    expect(screen.getByText("4,500 sq ft")).toBeTruthy();
    expect(screen.getByText("MATERIALS")).toBeTruthy();
    expect(screen.getByText("Off-form Concrete, Merbau Timber")).toBeTruthy();
  });
});

describe("reviews", () => {
  it("fallback returns James + Sarah verbatim", async () => {
    const reviews = await listApprovedReviews("the-pavilion");
    expect(reviews.map(r => r.guestName)).toContain("James");
    expect(reviews.map(r => r.guestName)).toContain("Sarah");
    expect(reviews[0].body).toContain("Immaculate architecture");
  });
});
