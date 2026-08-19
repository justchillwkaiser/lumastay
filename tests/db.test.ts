import { describe, it, expect } from "vitest";

describe("prisma client", () => {
  it("exports a db singleton with all models", async () => {
    const { db } = await import("@/lib/db");
    for (const m of ["property", "booking", "guest", "payment", "review",
      "availabilityBlock", "internalNote", "amenity", "propertyImage",
      "propertySpec", "user", "account", "session", "verification"] as const) {
      expect(db[m as keyof typeof db], m).toBeDefined();
    }
  });
});
