import { describe, it, expect } from "vitest";
import { buildIcs } from "@/lib/ics";

describe("buildIcs", () => {
  it("emits valid VEVENT with dates + summary", () => {
    const ics = buildIcs({
      reference: "LS-1024", propertyName: "The Pavilion at Hulu Langat",
      locationLine: "Hulu Langat, Selangor, Malaysia",
      checkIn: "2024-11-12", checkOut: "2024-11-18",
      checkInTime: "3:00 PM", checkOutTime: "11:00 AM",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:LumaStay - The Pavilion at Hulu Langat (LS-1024)");
    expect(ics).toContain("DTSTART:20241112T150000");
    expect(ics).toContain("DTEND:20241118T110000");
    expect(ics).toContain("LOCATION:Hulu Langat\\, Selangor\\, Malaysia");
  });
});
