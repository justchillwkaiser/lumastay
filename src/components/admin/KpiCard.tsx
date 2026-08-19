import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { LabelCaps } from "@/components/ui/LabelCaps";

export interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon?: ReactNode;
}

// KPI card (plan 3 task 7): LabelCaps label, display value mono-data 28px,
// subtext with icon.
export function KpiCard({ label, value, sub, icon }: KpiCardProps) {
  return (
    <Card className="p-5">
      <LabelCaps as="span" className="block">
        {label}
      </LabelCaps>
      <p className="mt-3 text-mono-data text-[28px] font-bold leading-none text-on-surface">
        {value}
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
        {icon}
        {sub}
      </p>
    </Card>
  );
}
