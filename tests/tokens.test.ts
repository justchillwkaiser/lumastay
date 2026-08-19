import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("design tokens", () => {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  it("contains brand colors from DESIGN.md", () => {
    expect(css).toContain("#18241b"); // primary
    expect(css).toContain("#2d3930"); // primary-container
    expect(css).toContain("#fbf9f9"); // surface
    expect(css).toContain("#1b1c1c"); // on-surface
    expect(css).toContain("#bccabd"); // sage accent (primary-fixed-dim)
  });
  it("contains Inter typography scale", () => {
    expect(css).toContain("Inter");
    expect(css).toContain("72px"); // display-lg
  });
  it("contains radius + spacing tokens", () => {
    expect(css).toContain("0.25rem"); // radius DEFAULT
    expect(css).toContain("1280px"); // container-max
  });
});
