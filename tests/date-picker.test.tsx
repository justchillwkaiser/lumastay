import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatePicker } from "@/components/guest/booking/DatePicker";
import type { DateState } from "@/lib/availability";

// October 2024, deterministic states (no "past" — month fixed in history).
const states: Record<string, DateState> = {};
for (let d = 1; d <= 31; d++) {
  states[`2024-10-${String(d).padStart(2, "0")}`] = "available";
}
states["2024-10-12"] = "available";
states["2024-10-13"] = "booked";
states["2024-10-14"] = "blocked";
states["2024-10-20"] = "hold";

describe("DatePicker", () => {
  it("endpoint cell is solid primary with white numerals", () => {
    render(
      <DatePicker
        month={{ year: 2024, month: 10 }}
        states={states}
        value={{ checkIn: "2024-10-12", checkOut: null }}
        onChange={() => {}}
      />,
    );
    const cell = screen.getByRole("button", { name: /^12 October 2024, / });
    expect(cell.className).toContain("bg-primary");
    expect(cell.className).toContain("text-on-primary");
  });

  it("in-range cell carries the sage band (primary-fixed-dim)", () => {
    render(
      <DatePicker
        month={{ year: 2024, month: 10 }}
        states={states}
        value={{ checkIn: "2024-10-12", checkOut: "2024-10-16" }}
        onChange={() => {}}
      />,
    );
    const cell = screen.getByRole("button", { name: /^13 October 2024, / });
    expect(cell.className).toContain("bg-primary-fixed-dim");
  });

  it("past cell renders the hatch pattern", () => {
    const pastStates = { ...states, "2024-10-01": "past" as DateState };
    render(
      <DatePicker
        month={{ year: 2024, month: 10 }}
        states={pastStates}
        value={{ checkIn: null, checkOut: null }}
        onChange={() => {}}
      />,
    );
    const cell = screen.getByRole("button", { name: /^1 October 2024, / });
    expect(cell.className).toContain("repeating-linear-gradient");
  });

  it("clicking 12 then 15 calls onChange with the range", () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        month={{ year: 2024, month: 10 }}
        states={states}
        value={{ checkIn: null, checkOut: null }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^16 October 2024, / }));
    expect(onChange).toHaveBeenLastCalledWith("2024-10-16", null);
    fireEvent.click(screen.getByRole("button", { name: /^18 October 2024, / }));
    expect(onChange).toHaveBeenLastCalledWith("2024-10-16", "2024-10-18");
  });

  it("rejects a range spanning a booked/blocked date (plan rule)", () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        month={{ year: 2024, month: 10 }}
        states={states}
        value={{ checkIn: null, checkOut: null }}
        onChange={onChange}
      />,
    );
    // 13 booked + 14 blocked sit strictly inside 12 → 15: range rejected,
    // the second click becomes the new start instead.
    fireEvent.click(screen.getByRole("button", { name: /^12 October 2024, / }));
    expect(onChange).toHaveBeenLastCalledWith("2024-10-12", null);
    fireEvent.click(screen.getByRole("button", { name: /^15 October 2024, / }));
    expect(onChange).toHaveBeenLastCalledWith("2024-10-15", null);
  });

  it("clicking the already-selected start resets the range", () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        month={{ year: 2024, month: 10 }}
        states={states}
        value={{ checkIn: "2024-10-12", checkOut: "2024-10-15" }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^12 October 2024, / }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
  });
});
