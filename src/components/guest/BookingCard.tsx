import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

import { Card } from "@/components/ui/Card";
import { LabelCaps } from "@/components/ui/LabelCaps";
import type { PropertyCardData } from "@/lib/seed-fallback";

export interface BookingCardProps {
  property: PropertyCardData;
}

// Sticky booking card for the property detail page (plan 2 task 5, per
// mockup secondpage p2). PRESENTATIONAL ONLY: the CHECK-IN / CHECK-OUT /
// GUESTS boxes are static placeholders ("Select date") — the interactive
// widgets land with the booking flow in Plan 3. The whole date block and
// the RESERVE NOW CTA link to /book/dates?property=<slug>.
function formatNightlyRate(nightlyRate: string): string {
  return `RM ${Number(nightlyRate).toLocaleString("en-MY", {
    maximumFractionDigits: 0,
  })}`;
}

export function BookingCard({ property }: BookingCardProps) {
  const bookingHref = `/book/dates?property=${property.slug}`;
  return (
    <Card className="p-6">
      <p className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold leading-none text-on-surface">
          {formatNightlyRate(property.nightlyRate)}
        </span>
        <span className="text-sm text-on-surface-variant">/ night</span>
      </p>

      <Link
        href={bookingHref}
        aria-label="Select dates and guests"
        className="mt-5 block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="grid grid-cols-2 rounded border border-outline-variant">
          <div className="p-3">
            <LabelCaps as="span" className="block">
              Check-in
            </LabelCaps>
            <span className="mt-1 block text-sm text-on-surface-variant">
              Select date
            </span>
          </div>
          <div className="border-l border-outline-variant p-3">
            <LabelCaps as="span" className="block">
              Check-out
            </LabelCaps>
            <span className="mt-1 block text-sm text-on-surface-variant">
              Select date
            </span>
          </div>
          <div className="col-span-2 flex items-center justify-between border-t border-outline-variant p-3">
            <div>
              <LabelCaps as="span" className="block">
                Guests
              </LabelCaps>
              <span className="mt-1 block text-sm text-on-surface">
                1 guest
              </span>
            </div>
            <CaretDown size={16} strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
      </Link>

      <Link
        href={bookingHref}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Reserve now
      </Link>
      <p className="mt-3 text-center text-sm text-on-surface-variant">
        {"You won't be charged yet"}
      </p>
    </Card>
  );
}
