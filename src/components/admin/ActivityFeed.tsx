import { CalendarPlus, CreditCard, UserPlus } from "@phosphor-icons/react/dist/ssr";

import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

const ICONS: Record<string, typeof CalendarPlus> = {
  "calendar-plus": CalendarPlus,
  "credit-card": CreditCard,
  "user-plus": UserPlus,
};

export interface ActivityItem {
  icon: string;
  title: string;
  sub: string;
  ago: string;
}

// Recent Activity feed (plan 3 task 7): icon squares surface-container,
// divider rows.
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="p-5">
      <LabelCaps as="span" className="block">
        Recent Activity
      </LabelCaps>
      <div className="mt-4">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? CalendarPlus;
          return (
            <div key={i}>
              {i > 0 && <Divider className="my-3" />}
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-container text-on-surface">
                  <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {item.title}
                  </p>
                  <p className="truncate text-sm text-on-surface-variant">
                    {item.sub}
                  </p>
                </div>
                <span className="shrink-0 text-label-caps text-on-surface-variant">
                  {item.ago}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
