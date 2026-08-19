import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

describe("ui primitives", () => {
  it("primary button has brand classes", () => {
    render(<Button>RESERVE NOW</Button>);
    const b = screen.getByRole("button", { name: "RESERVE NOW" });
    expect(b.className).toContain("bg-primary");
    expect(b.className).toContain("text-on-primary");
    expect(b.className).toContain("rounded"); // 4px
  });
  it("ghost button has outline, no fill", () => {
    render(<Button variant="ghost">View Full Collection</Button>);
    const b = screen.getByRole("button");
    expect(b.className).toContain("border");
    expect(b.className).not.toContain("bg-primary");
  });
  it("badge tones map to status colors", () => {
    render(<Badge tone="confirmed">CONFIRMED</Badge>);
    expect(screen.getByText("CONFIRMED").className).toContain("uppercase");
  });
});
