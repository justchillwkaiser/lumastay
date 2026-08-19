import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import type { BookingParams } from "@/lib/booking-params";
import type { PriceBreakdown } from "@/lib/pricing";
import type { PropertyCardData } from "@/lib/seed-fallback";

export interface SummaryCardProps {
  property: PropertyCardData;
  params: BookingParams;
  /** Server-recomputed breakdown; null until a valid range is chosen. */
  breakdown: PriceBreakdown | null;
  /** CTA button slot (ContinueButton / ConfirmButton). */
  children?: React.ReactNode;
}

function formatMyr(amount: string): string {
  return `RM ${Number(amount).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <LabelCaps as="span">{label}</LabelCaps>
      <span className="text-mono-data text-on-surface">{value}</span>
    </div>
  );
}

// Right-column booking summary card (plan 3 task 2, per review mockup):
// grayscale villa thumb, LabelCaps eyebrow + shortName, mono-data rate,
// CHECK-IN/CHECK-OUT two-col, breakdown rows, TOTAL, CTA slot.
export function SummaryCard({
  property,
  params,
  breakdown,
  children,
}: SummaryCardProps) {
  const guestLine = `${params.adults} Adult${params.adults === 1 ? "" : "s"}${
    params.children > 0
      ? `, ${params.children} Child${params.children === 1 ? "" : "ren"}`
      : ""
  }`;

  return (
    <Card className="p-6">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
        <Image
          src={property.cardImage}
          alt={property.shortName}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover grayscale"
        />
      </div>

      <LabelCaps as="span" className="mt-5 block">
        The Villas
      </LabelCaps>
      <h2 className="mt-1 text-headline-sm font-semibold text-on-surface">
        {property.shortName}
      </h2>
      <p className="mt-1 text-mono-data text-on-surface-variant">
        {formatMyr(property.nightlyRate)} / night
      </p>

      <Divider className="my-5" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <LabelCaps as="span" className="block">
            Check-in
          </LabelCaps>
          <span className="mt-1 block text-sm text-on-surface">
            {formatDate(params.checkIn)}
          </span>
        </div>
        <div>
          <LabelCaps as="span" className="block">
            Check-out
          </LabelCaps>
          <span className="mt-1 block text-sm text-on-surface">
            {formatDate(params.checkOut)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <LabelCaps as="span" className="block">
          Guests
        </LabelCaps>
        <span className="mt-1 block text-sm text-on-surface">{guestLine}</span>
      </div>

      {breakdown && (
        <>
          <Divider className="my-5" />
          <div className="space-y-3">
            <Row
              label={`${formatMyr(breakdown.nightlyRate)} × ${breakdown.nights} night${breakdown.nights === 1 ? "" : "s"}`}
              value={formatMyr(breakdown.subtotal)}
            />
            <Row label="Cleaning fee" value={formatMyr(breakdown.cleaningFee)} />
            <Row label="Service fee" value={formatMyr(breakdown.serviceFee)} />
            {Number(breakdown.taxAmount) > 0 && (
              <Row label="Taxes" value={formatMyr(breakdown.taxAmount)} />
            )}
          </div>
          <Divider className="my-5" />
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-on-surface">Total</span>
            <span className="text-mono-data text-xl font-bold text-on-surface">
              {formatMyr(breakdown.total)}
            </span>
          </div>
        </>
      )}

      {children && <div className="mt-6">{children}</div>}
    </Card>
  );
}
