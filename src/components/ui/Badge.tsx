import type { HTMLAttributes } from "react";

type BadgeTone = "confirmed" | "pending" | "cancelled" | "completed" | "failed";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

// Soft-fill status tones per spec §3.4: confirmed = primary-fixed mint,
// pending = secondary-fixed grey, cancelled = error-container red.
// completed = primary-container solid (stay done), failed = tertiary gray
// (distinct from cancelled red).
const tones: Record<BadgeTone, string> = {
  confirmed: "bg-primary-fixed text-primary-container",
  pending: "bg-secondary-fixed text-on-surface-variant",
  cancelled: "bg-error-container text-error",
  completed: "bg-primary-container text-on-primary",
  failed: "bg-tertiary-container text-on-tertiary-container",
};

const base =
  "inline-flex items-center rounded px-2 py-1 text-label-caps font-bold uppercase tracking-[0.1em] leading-none";

export function Badge({ tone = "confirmed", className, ...props }: BadgeProps) {
  const cls = [base, tones[tone], className].filter(Boolean).join(" ");
  return <span className={cls} {...props} />;
}
