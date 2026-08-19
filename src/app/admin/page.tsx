import { Clock, TrendUp } from "@phosphor-icons/react/dist/ssr";

import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { BookingActivityChart } from "@/components/admin/BookingActivityChart";
import { KpiCard } from "@/components/admin/KpiCard";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { getOverviewMetrics } from "@/lib/admin-metrics";

export const metadata = { title: "Overview — LumaStay Admin" };

function formatMyr(amount: string): string {
  return `RM ${Number(amount).toLocaleString("en-MY", {
    maximumFractionDigits: 0,
  })}`;
}

// Admin Overview (plan 3 task 7): headline + subcopy, 3 KPI cards, dark
// guest-arrival alert card, 30-day activity chart, recent activity feed.
export default async function AdminOverviewPage() {
  const m = await getOverviewMetrics();

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Overview
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Today at a glance — arrivals, revenue, and booking activity.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <KpiCard
          label="Revenue (YTD)"
          value={formatMyr(m.revenueYtd)}
          sub={`+${m.revenueDeltaPct}% vs last year`}
          icon={<TrendUp size={16} strokeWidth={1.5} aria-hidden="true" className="text-primary" />}
        />
        <KpiCard
          label="Occupancy"
          value={`${m.occupancyPct}%`}
          sub="This month, all villas"
          icon={<Clock size={16} strokeWidth={1.5} aria-hidden="true" />}
        />
        <KpiCard
          label="Total Bookings"
          value={m.totalBookings.toLocaleString("en-MY")}
          sub={`${m.pendingCount} pending review`}
          icon={<Clock size={16} strokeWidth={1.5} aria-hidden="true" />}
        />
      </div>

      {m.nextArrival && (
        <div className="mt-5 rounded bg-primary-container p-5 text-on-primary">
          <LabelCaps as="span" className="block text-on-primary">
            ⚠ Important today
          </LabelCaps>
          <p className="mt-3 text-sm font-semibold">Guest Arrival</p>
          <p className="mt-1 text-lg font-bold">
            {m.nextArrival.guestName} at {m.nextArrival.property}
          </p>
          <p className="mt-1 text-sm opacity-80">
            {m.nextArrival.guests} Guests • {m.nextArrival.time}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <BookingActivityChart data={m.activity30d} />
        <ActivityFeed items={m.recent} />
      </div>
    </div>
  );
}
