import type { HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

// 1px hairline per spec §3.4 (#E0E0E0, exposed as the hairline token).
export function Divider({
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  const size =
    orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch";
  const cls = ["shrink-0 border-0 bg-hairline", size, className]
    .filter(Boolean)
    .join(" ");
  return (
    <hr
      aria-orientation={orientation}
      className={cls}
      {...props}
    />
  );
}
