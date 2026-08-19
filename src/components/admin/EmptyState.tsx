import type { ReactNode } from "react";

import { LabelCaps } from "@/components/ui/LabelCaps";

// Empty state (admin polish): icon + title + guidance + optional CTA.
// Distinguishes "no data" from "no results for this filter".
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
      <LabelCaps as="span">{title}</LabelCaps>
      <p className="mt-3 max-w-[360px] text-sm text-on-surface-variant">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
