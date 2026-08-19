"use client";

import { Minus, Plus } from "@phosphor-icons/react";

import { LabelCaps } from "@/components/ui/LabelCaps";

// Guest counters (plan 3 task 3): client leaf, minus/plus square buttons,
// values lifted to the parent RSC via onChange → URL navigation.
export interface GuestCountersProps {
  adults: number;
  children: number;
  maxGuests: number;
  onChange: (adults: number, children: number) => void;
}

function CounterRow({
  label,
  sublabel,
  value,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
  ariaLabel,
}: {
  label: string;
  sublabel: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled: boolean;
  incrementDisabled: boolean;
  ariaLabel: string;
}) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-sm border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  return (
    <div className="flex items-center justify-between border-b border-hairline py-5">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <LabelCaps as="span" className="mt-1 block">
          {sublabel}
        </LabelCaps>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Decrease ${ariaLabel}`}
          disabled={decrementDisabled}
          onClick={onDecrement}
          className={btn}
        >
          <Minus size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <span className="w-6 text-center text-mono-data text-on-surface">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${ariaLabel}`}
          disabled={incrementDisabled}
          onClick={onIncrement}
          className={btn}
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function GuestCounters({
  adults,
  children,
  maxGuests,
  onChange,
}: GuestCountersProps) {
  const total = adults + children;
  return (
    <div>
      <CounterRow
        label="Adults"
        sublabel="Ages 16+"
        value={adults}
        ariaLabel="adults"
        decrementDisabled={adults <= 1}
        incrementDisabled={adults >= 16 || total >= maxGuests}
        onDecrement={() => onChange(adults - 1, children)}
        onIncrement={() => onChange(adults + 1, children)}
      />
      <CounterRow
        label="Children"
        sublabel="Ages 0–12"
        value={children}
        ariaLabel="children"
        decrementDisabled={children <= 0}
        incrementDisabled={children >= 10 || total >= maxGuests}
        onDecrement={() => onChange(adults, children - 1)}
        onIncrement={() => onChange(adults, children + 1)}
      />
    </div>
  );
}
