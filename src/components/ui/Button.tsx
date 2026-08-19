import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-label-caps font-bold uppercase tracking-[0.1em] leading-none transition-colors active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary",
  ghost: "border border-outline-variant bg-transparent text-on-surface",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className, ...props }, ref) {
    const cls = [base, variants[variant], className].filter(Boolean).join(" ");
    return <button ref={ref} className={cls} {...props} />;
  },
);
