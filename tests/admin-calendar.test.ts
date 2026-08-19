import { describe, it, expect, vi } from "vitest";

const { bookingFindMany, blockFindMany, propertyFindMany } = vi.hoisted(() => ({
  bookingFindMany: vi.fn(),
  blockFindMany: vi.fn(),
  propertyFindMany: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    booking: { findMany: bookingFindMany },
    availabilityBlock: { findMany: blockFindMany },
    property: { findMany: propertyFindMany },
  },
}));

describe("getAdminMonthMatrix", () => {
  it("MON-first weeks, cell states merge bookings + blocks, prev-month days muted", async () => {
    // October 2024 starts on a Tuesday => week 1 has Monday Sep 30 (muted).
    bookingFindMany.mockResolvedValue([
      {
        checkIn: new Date("2024-10-12T00:00:00Z"),
        checkOut: new Date("2024-10-15T00:00:00Z"),
        status: "CONFIRMED",
        guest: { name: "Smith Family" },
        property: { shortName: "The Pavilion" },
      },
    ]);
    blockFindMany.mockResolvedValue([
      {
        startDate: new Date("2024-10-20T00:00:00Z"),
        endDate: new Date("2024-10-22T00:00:00Z"),
        type: "HOLD",
        label: "Hold: Corp Retreat",
      },
    ]);
    propertyFindMany.mockResolvedValue([{ id: "p1" }]);

    const { getAdminMonthMatrix } = await import("@/lib/admin-calendar");
    const matrix = await getAdminMonthMatrix("all", 2024, 10);

    // MON-first: first cell of week 1 is Monday Sep 30 (prev month, muted).
    expect(matrix.weeks[0][0].date).toBe("2024-09-30");
    expect(matrix.weeks[0][0].muted).toBe(true);
    expect(matrix.weeks[0][1].date).toBe("2024-10-01");
    expect(matrix.weeks[0][1].muted).toBe(false);

    const flat = matrix.weeks.flat();
    const booked = flat.find((c) => c.date === "2024-10-12");
    expect(booked?.state).toBe("booked");
    expect(booked?.label).toBe("Smith Family");
    // checkout day free again
    expect(flat.find((c) => c.date === "2024-10-15")?.state).toBe("available");
    // hold
    expect(flat.find((c) => c.date === "2024-10-20")?.state).toBe("hold");
  });

  it("DB offline => all-available matrix (render-only fallback)", async () => {
    bookingFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    blockFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    propertyFindMany.mockRejectedValue(new Error("ECONNREFUSED"));
    const { getAdminMonthMatrix } = await import("@/lib/admin-calendar");
    const matrix = await getAdminMonthMatrix("p1", 2024, 10);
    const flat = matrix.weeks.flat();
    expect(flat.find((c) => c.date === "2024-10-12")?.state).toBe("available");
  });
});
