import { Check } from "@phosphor-icons/react/dist/ssr";

import { LabelCaps } from "@/components/ui/LabelCaps";

export interface BookingStepperProps {
  /** Current step, 1-based. */
  step: number;
  /** "text" for steps 1–3, "circle" for step 4+ (plan 3 global constraints). */
  variant: "text" | "circle";
  steps: string[];
}

// Stepper two variants verbatim (plan 3):
// - text-style: active = on-surface + 2px primary underline, done =
//   on-surface-variant, upcoming = muted.
// - circle-style: 28px circles, done = filled primary + white Check,
//   current = 1px outline + number, connector hairlines, labels below.
export function BookingStepper({ step, variant, steps }: BookingStepperProps) {
  if (variant === "text") {
    return (
      <nav aria-label="Booking progress">
        <ol className="flex items-center gap-6">
          {steps.map((label, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "upcoming";
            const color =
              state === "active"
                ? "text-on-surface"
                : state === "done"
                  ? "text-on-surface-variant"
                  : "text-on-surface-variant opacity-50";
            return (
              <li key={label} aria-current={state === "active" ? "step" : undefined}>
                <LabelCaps
                  as="span"
                  className={`${color} pb-1 ${
                    state === "active" ? "border-b-2 border-primary" : ""
                  }`}
                >
                  {label}
                </LabelCaps>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-start">
        {steps.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "upcoming";
          const circle =
            state === "done"
              ? "bg-primary text-on-primary"
              : state === "current"
                ? "border border-primary text-on-surface"
                : "border border-outline-variant text-on-surface-variant opacity-60";
          return (
            <li
              key={label}
              className="flex items-start"
              aria-current={state === "current" ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${circle}`}
                >
                  {state === "done" ? (
                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    n
                  )}
                </span>
                <LabelCaps as="span" className={state === "upcoming" ? "opacity-50" : ""}>
                  {label}
                </LabelCaps>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-3 mt-[13px] h-px w-10 bg-hairline"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
