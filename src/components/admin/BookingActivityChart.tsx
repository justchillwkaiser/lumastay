import { Card } from "@/components/ui/Card";
import { LabelCaps } from "@/components/ui/LabelCaps";

export interface BookingActivityChartProps {
  data: { date: string; count: number }[];
}

// Booking activity (plan 3 task 7): CSS bar chart — 30 bars surface-dim,
// max bar primary, x labels first/mid/last, "VIEW FULL REPORT" stub.
export function BookingActivityChart({ data }: BookingActivityChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between">
        <LabelCaps as="span">Booking Activity — 30 Days</LabelCaps>
        <span
          aria-disabled="true"
          title="Coming in phase 2"
          className="cursor-not-allowed text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant opacity-50"
        >
          View full report
        </span>
      </div>

      <div
        role="img"
        aria-label="Booking activity bar chart for the last 30 days"
        className="mt-6 flex h-32 items-end gap-1"
      >
        {data.map((d, i) => (
          <span
            key={i}
            title={`${d.date}: ${d.count}`}
            className={`flex-1 rounded-sm ${
              d.count === max ? "bg-primary" : "bg-surface-dim"
            }`}
            style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }}
          />
        ))}
      </div>

      <div className="mt-3 flex justify-between text-label-caps text-on-surface-variant">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </Card>
  );
}
