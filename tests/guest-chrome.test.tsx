import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TopNavBar } from "@/components/guest/TopNavBar";
import { Footer } from "@/components/guest/Footer";

describe("guest chrome", () => {
  it("navbar has brand + 4 links + CTA", () => {
    render(<TopNavBar active="villas" />);
    expect(screen.getByText("LUMASTAY")).toBeTruthy();
    for (const l of ["Our Heritage", "The Villas", "Experiences", "Sustainability"])
      expect(screen.getByText(l)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book Your Stay" })).toBeTruthy();
  });
  it("active link has underline style", () => {
    render(<TopNavBar active="villas" />);
    expect(screen.getByText("The Villas").className).toContain("underline");
  });
  it("CTA uses primary-container green", () => {
    render(<TopNavBar active="villas" />);
    expect(screen.getByRole("link", { name: "Book Your Stay" }).className)
      .toContain("bg-primary-container");
  });
  it("footer is text-only with verbatim legal copy", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 LUMASTAY MALAYSIA\./)).toBeTruthy();
    expect(screen.getByText(/ARCHITECTURAL PERMANENCE\./)).toBeTruthy();
    for (const l of ["Privacy Policy", "Terms of Service", "Press Kit", "Contact"])
      expect(screen.getByText(l)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull(); // no newsletter input
  });
});
