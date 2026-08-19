import type { LabelHTMLAttributes } from "react";

export type LabelCapsProps = LabelHTMLAttributes<HTMLLabelElement>;

// 12px / 700 / uppercase / 0.1em tracking per spec label-caps scale.
export function LabelCaps({ className, ...props }: LabelCapsProps) {
  const cls = [
    "text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <label className={cls} {...props} />;
}
