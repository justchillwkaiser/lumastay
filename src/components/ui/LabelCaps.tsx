import type { HTMLAttributes, LabelHTMLAttributes } from "react";

interface LabelCapsBaseProps {
  /** Render as a non-label element (e.g. inside links/headings) while
   *  keeping the label-caps type scale. Defaults to "label". */
  as?: "label" | "span" | "p" | "div";
  className?: string;
}

export type LabelCapsProps = LabelCapsBaseProps &
  (
    | ({ as?: "label" } & Omit<
        LabelHTMLAttributes<HTMLLabelElement>,
        "as" | "className"
      >)
    | ({ as: "span" | "p" | "div" } & Omit<
        HTMLAttributes<HTMLElement>,
        "as" | "className"
      >)
  );

// 12px / 700 / uppercase / 0.1em tracking per spec label-caps scale.
export function LabelCaps(props: LabelCapsProps) {
  const { as, className, ...rest } = props;
  const cls = [
    "text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  if (!as || as === "label") {
    return (
      <label
        className={cls}
        {...(rest as LabelHTMLAttributes<HTMLLabelElement>)}
      />
    );
  }
  const Tag = as;
  return (
    <Tag className={cls} {...(rest as HTMLAttributes<HTMLElement>)} />
  );
}
