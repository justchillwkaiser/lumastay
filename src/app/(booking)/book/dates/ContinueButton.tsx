"use client";

import Link from "next/link";

// Shared step navigation (plan 3 task 3): client leaf that receives the
// fully-built href + enabled state via props (NO useSearchParams — the
// parent RSC owns all URL state).
export interface ContinueButtonProps {
  href: string;
  enabled: boolean;
  label?: string;
}

export function ContinueButton({
  href,
  enabled,
  label = "Continue",
}: ContinueButtonProps) {
  const cls =
    "inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  if (!enabled) {
    return (
      <span aria-disabled="true" className={`${cls} pointer-events-none opacity-50`}>
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}
