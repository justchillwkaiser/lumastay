import { describe, it, expect } from "vitest";

import { listProperties } from "@/lib/properties";

describe("listProperties", () => {
  it("returns 4 active villas ordered for collection", async () => {
    const list = await listProperties();
    expect(list).toHaveLength(4);
    expect(list.map((p) => p.slug)).toContain("the-pavilion");
  });
});
