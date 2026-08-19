import type { HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

// 1px hairline #E0E0E0 per spec.
export function Divider({
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  const size =
    orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch";
  const cls = ["shrink-0 border-0 bg-[#E0E0E0]", size, className]
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
