import type { HTMLAttributes } from "react";

type BadgeTone = "confirmed" | "pending" | "cancelled";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

// Soft-fill status tones per spec §3.4: confirmed = primary-fixed mint,
// pending = secondary-fixed grey, cancelled = error-container red.
const tones: Record<BadgeTone, string> = {
  confirmed: "bg-[#d8e6d9] text-[#2d3930]",
  pending: "bg-[#e2e3e1] text-[#434843]",
  cancelled: "bg-[#ffdad6] text-[#ba1a1a]",
};

const base =
  "inline-flex items-center rounded px-2 py-1 text-label-caps font-bold uppercase tracking-[0.1em] leading-none";

export function Badge({ tone = "confirmed", className, ...props }: BadgeProps) {
  const cls = [base, tones[tone], className].filter(Boolean).join(" ");
  return <span className={cls} {...props} />;
}
