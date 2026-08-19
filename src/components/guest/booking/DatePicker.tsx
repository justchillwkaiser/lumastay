"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, Prohibit } from "@phosphor-icons/react";

import { LabelCaps } from "@/components/ui/LabelCaps";
import type { DateState } from "@/lib/availability";

export interface DatePickerValue {
  checkIn: string | null;
  checkOut: string | null;
}

export interface DatePickerProps {
  /** Visible month. `month` is 1-based (10 = October). */
  month: { year: number; month: number };
  states: Record<string, DateState>;
  value: DatePickerValue;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  onMonthChange?: (month: { year: number; month: number }) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Calendar states verbatim (plan 3 global constraints): past = hatched;
// endpoints = solid primary white numerals; range = primary-fixed-dim sage
// band; blocked = surface-dim + Prohibit icon; hold = sage block dark text.
const HATCH =
  "bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,var(--color-surface-dim)_3px,var(--color-surface-dim)_4px)]";

function key(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function ariaLabel(year: number, month: number, day: number, state: DateState): string {
  return `${day} ${MONTH_NAMES[month - 1]} ${year}, ${state}`;
}

/** Non-selectable states can never be an endpoint or sit inside a range. */
function selectable(state: DateState): boolean {
  return state === "available";
}

export function DatePicker({
  month,
  states,
  value,
  onChange,
  onMonthChange,
}: DatePickerProps) {
  const { year, month: mon } = month;
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  // Grid offset: weekday (Sun-first) of the 1st.
  const firstWeekday = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();

  const stateOf = (day: number): DateState => states[key(year, mon, day)] ?? "available";

  // Range selection is local draft state seeded from the controlled value,
  // so intermediate clicks (start picked, end not yet) render immediately.
  const [draft, setDraft] = useState<DatePickerValue>(value);
  useEffect(() => setDraft(value), [value.checkIn, value.checkOut]);

  const handlePick = (day: number) => {
    const dateKey = key(year, mon, day);
    if (!selectable(stateOf(day))) return;

    const { checkIn, checkOut } = draft;
    let next: DatePickerValue;
    if (dateKey === checkIn && checkIn !== null) {
      // Clicking the already-selected start resets the range (any state).
      next = { checkIn: null, checkOut: null };
    } else if (checkIn === null || checkOut !== null) {
      // Fresh start (or restart after a complete range).
      next = { checkIn: dateKey, checkOut: null };
    } else if (dateKey < checkIn) {
      next = { checkIn: dateKey, checkOut: null };
    } else {
      // Candidate checkout: no non-selectable date strictly inside (in, out).
      const start = new Date(`${checkIn}T00:00:00Z`);
      const end = new Date(`${dateKey}T00:00:00Z`);
      let clear = true;
      for (let t = start.getTime() + 86400000; t < end.getTime(); t += 86400000) {
        const k = new Date(t).toISOString().slice(0, 10);
        if (!selectable(states[k] ?? "available")) {
          clear = false;
          break;
        }
      }
      next = clear
        ? { checkIn, checkOut: dateKey }
        : { checkIn: dateKey, checkOut: null };
    }
    setDraft(next);
    onChange(next.checkIn, next.checkOut);
  };

  const cellClass = (day: number): string => {
    const dateKey = key(year, mon, day);
    const state = stateOf(day);
    const isStart = draft.checkIn === dateKey;
    const isEnd = draft.checkOut === dateKey;
    const inRange =
      draft.checkIn !== null &&
      draft.checkOut !== null &&
      dateKey > draft.checkIn &&
      dateKey < draft.checkOut;

    const base =
      "relative flex h-10 w-10 items-center justify-center rounded-sm text-sm transition-colors";
    if (isStart || isEnd) return `${base} bg-primary font-semibold text-on-primary`;
    if (inRange) return `${base} bg-primary-fixed-dim text-on-surface`;
    switch (state) {
      case "past":
        return `${base} ${HATCH} cursor-not-allowed text-on-surface-variant`;
      case "blocked":
        return `${base} cursor-not-allowed bg-surface-dim text-on-surface-variant`;
      case "hold":
        return `${base} cursor-not-allowed bg-primary-fixed-dim font-semibold text-on-surface`;
      case "booked":
        return `${base} cursor-not-allowed bg-primary-container text-on-primary`;
      default:
        return `${base} text-on-surface hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`;
    }
  };

  // Keyboard: roving focus across day cells, arrows move, Enter selects.
  const gridRef = useRef<HTMLDivElement>(null);
  const focusDay = (day: number) => {
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${day}"]`)
      ?.focus();
  };
  const handleKeyDown = (e: React.KeyboardEvent, day: number) => {
    const moves: Record<string, number> = {
      ArrowLeft: day - 1,
      ArrowRight: day + 1,
      ArrowUp: day - 7,
      ArrowDown: day + 7,
    };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePick(day);
      return;
    }
    const target = moves[e.key];
    if (target === undefined) return;
    e.preventDefault();
    if (target >= 1 && target <= daysInMonth) focusDay(target);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(year, mon - 1 + delta, 1));
    onMonthChange?.({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  };

  const days: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CaretLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <LabelCaps as="span" className="text-on-surface">
          {MONTH_NAMES[mon - 1]} {year}
        </LabelCaps>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CaretRight size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1" role="rowheader">
        {WEEKDAYS.map((d, i) => (
          <LabelCaps key={i} as="span" className="flex h-8 items-center justify-center">
            {d}
          </LabelCaps>
        ))}
      </div>

      <div ref={gridRef} className="grid grid-cols-7 gap-1" role="grid">
        {days.map((day, i) =>
          day === null ? (
            <span key={`blank-${i}`} className="h-10 w-10" aria-hidden="true" />
          ) : (
            <button
              key={day}
              type="button"
              data-day={day}
              data-state={stateOf(day)}
              aria-label={ariaLabel(year, mon, day, stateOf(day))}
              disabled={!selectable(stateOf(day))}
              onClick={() => handlePick(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              className={cellClass(day)}
            >
              {stateOf(day) === "blocked" ? (
                <Prohibit size={16} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                day
              )}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
