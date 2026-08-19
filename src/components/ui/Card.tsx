import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

// Swiss rules: 1px outline-variant border, no shadow, radius 0-4px.
export function Card({ className, ...props }: CardProps) {
  const cls = [
    "rounded border border-outline-variant bg-surface-container-lowest",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={cls} {...props} />;
}
