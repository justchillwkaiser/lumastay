import { AvailabilityCalendar } from "@/components/admin/AvailabilityCalendar";
import { QuickActions } from "@/components/admin/QuickActions";
import { Card } from "@/components/ui/Card";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { getAdminMonthMatrix } from "@/lib/admin-calendar";
import { listProperties } from "@/lib/properties";

export const metadata = { title: "Availability Calendar — LumaStay Admin" };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Admin Availability Calendar (plan 3 task 10): property dropdown + Month/
// Timeline segmented (Timeline aria-disabled phase 2), month nav, legend,
// booking bars, Quick Actions + Weekly Utilization cards.
export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const now = new Date();
  const year = Number(str("year")) || now.getUTCFullYear();
  const month = Number(str("month")) || now.getUTCMonth() + 1;
  const propertyId = str("property") ?? "all";

  const [matrix, properties] = await Promise.all([
    getAdminMonthMatrix(propertyId, year, month),
    listProperties(),
  ]);

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const navHref = (y: number, m: number) =>
    `/admin/calendar?property=${propertyId}&year=${y}&month=${m}`;

  // Weekly utilization: share of booked nights per week row (in-month only).
  const utilization = matrix.weeks.map((week) => {
    const inMonth = week.filter((c) => !c.muted);
    if (inMonth.length === 0) return 0;
    const booked = inMonth.filter((c) => c.state === "booked").length;
    return Math.round((booked / inMonth.length) * 100);
  });

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
            Availability Calendar
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Bookings, holds, and maintenance blocks across the collection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form method="get">
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="month" value={month} />
            <select
              name="property"
              defaultValue={propertyId}
              onChange={undefined}
              aria-label="Property filter"
              className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-outline"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.slug} value={p.slug}>{p.shortName}</option>
              ))}
            </select>
          </form>
          <div className="flex rounded border border-outline-variant">
            <span className="bg-tertiary px-3 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-tertiary">
              Month
            </span>
            <span
              aria-disabled="true"
              title="Coming in phase 2"
              className="cursor-not-allowed px-3 py-2 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant opacity-50"
            >
              Timeline
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <a href={navHref(prev.year, prev.month)} className="text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant hover:text-on-surface">
          ‹ {MONTH_NAMES[prev.month - 1]}
        </a>
        <span className="text-sm font-semibold text-on-surface">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <a href={navHref(next.year, next.month)} className="text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant hover:text-on-surface">
          {MONTH_NAMES[next.month - 1]} ›
        </a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded border border-outline-variant bg-surface-container-lowest">
          <AvailabilityCalendar matrix={matrix} />
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <LabelCaps as="span" className="block">
              Weekly Utilization
            </LabelCaps>
            <div className="mt-4 space-y-3">
              {utilization.slice(0, 4).map((pct, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-8 text-label-caps text-on-surface-variant">
                    W{i + 1}
                  </span>
                  <span className="h-2 flex-1 rounded-sm bg-surface-container">
                    <span
                      className="block h-2 rounded-sm bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-10 text-right text-mono-data text-on-surface">
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <QuickActions
            properties={properties.map((p) => ({ id: p.slug, name: p.shortName }))}
          />
        </div>
      </div>
    </div>
  );
}
