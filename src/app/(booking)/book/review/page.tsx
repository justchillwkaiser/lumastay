import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { BookingStepper } from "@/components/guest/booking/BookingStepper";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import {
  parseBookingParams,
  requireParamsFor,
  type BookingParams,
} from "@/lib/booking-params";
import { computePrice } from "@/lib/pricing";
import { getPropertyBySlug } from "@/lib/properties";
import { ConfirmButton } from "./ConfirmButton";

export const metadata = { title: "Review your stay — LumaStay" };

const STEPS = ["Dates", "Guests", "Details", "Review", "Payment"];

function nightsOf(params: BookingParams): number {
  const ms =
    new Date(`${params.checkOut!}T00:00:00Z`).getTime() -
    new Date(`${params.checkIn!}T00:00:00Z`).getTime();
  return Math.round(ms / 86400000);
}

function formatReviewDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMyr(amount: string): string {
  return `RM ${Number(amount).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <LabelCaps as="span">{label}</LabelCaps>
      <span className="text-right text-sm text-on-surface">{value}</span>
    </div>
  );
}

// Step 4 — review (plan 3 task 4). Full params guard (dates+guests+details);
// circle stepper step=4; price recomputed server-side from Property rates.
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = new URLSearchParams(
    Object.entries(await searchParams).flatMap(([k, v]) =>
      typeof v === "string" ? [[k, v]] : [],
    ),
  );
  const params = parseBookingParams(sp);
  try {
    requireParamsFor("review", params);
  } catch (e) {
    redirect((e as Error).message.replace("REDIRECT:", ""));
  }

  const property = await getPropertyBySlug(params.property!);
  if (!property) notFound();

  const nights = nightsOf(params);
  const price = computePrice(
    {
      nightlyRate: property.nightlyRate,
      cleaningFee: property.cleaningFee,
      serviceFeePct: property.serviceFeePct,
      taxPct: property.taxPct,
    },
    nights,
  );

  const guestLine = `${params.adults} Adult${params.adults === 1 ? "" : "s"}${
    params.children > 0
      ? `, ${params.children} Child${params.children === 1 ? "" : "ren"}`
      : ""
  }`;

  const payload = {
    property: params.property,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: params.adults,
    children: params.children,
    name: params.name,
    email: params.email,
    phone: params.phone,
    specialRequests: params.requests ?? "",
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10 lg:py-16">
      <div className="flex justify-center">
        <BookingStepper step={4} variant="circle" steps={STEPS} />
      </div>
      <h1 className="mt-10 text-center text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Review Your Stay
      </h1>

      <div className="mx-auto mt-12 grid max-w-[960px] gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-8">
          <Card className="p-6">
            <LabelCaps as="span" className="block">
              Booking Summary
            </LabelCaps>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={property.cardImage}
                  alt={property.shortName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Private Villa with Pool
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Non-smoking • 1 King Bed
                </p>
              </div>
            </div>
            <Divider className="my-2 mt-4" />
            <SummaryRow label="Property" value={property.shortName} />
            <Divider />
            <SummaryRow label="Guests" value={guestLine} />
            <Divider />
            <SummaryRow
              label="Check-in"
              value={`${formatReviewDate(params.checkIn!)} - From ${property.checkInTime}`}
            />
            <Divider />
            <SummaryRow
              label="Check-out"
              value={`${formatReviewDate(params.checkOut!)} - Until ${property.checkOutTime}`}
            />
          </Card>

          <Card className="p-6">
            <LabelCaps as="span" className="block">
              Guest Details
            </LabelCaps>
            <div className="mt-4 space-y-4">
              <div>
                <LabelCaps as="span" className="block">
                  Primary guest
                </LabelCaps>
                <p className="mt-1 text-sm text-on-surface">{params.name}</p>
              </div>
              <div>
                <LabelCaps as="span" className="block">
                  Contact
                </LabelCaps>
                <p className="mt-1 text-sm text-on-surface">{params.email}</p>
                <p className="text-sm text-on-surface">{params.phone}</p>
              </div>
              {params.requests && (
                <div>
                  <LabelCaps as="span" className="block">
                    Special requests
                  </LabelCaps>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {params.requests}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column — price card */}
        <div>
          <Card className="sticky top-24 p-6">
            <LabelCaps as="span" className="block">
              Price Details
            </LabelCaps>
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-on-surface">
                  {nights} night{nights === 1 ? "" : "s"} x{" "}
                  {formatMyr(price.nightlyRate)}
                </span>
                <span className="text-mono-data text-on-surface">
                  {formatMyr(price.subtotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-on-surface">Cleaning Fee</span>
                <span className="text-mono-data text-on-surface">
                  {formatMyr(price.cleaningFee)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-on-surface">Service Fee</span>
                <span className="text-mono-data text-on-surface">
                  {formatMyr(price.serviceFee)}
                </span>
              </div>
            </div>
            <Divider className="my-5" />
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-on-surface">
                Total <span className="text-sm font-normal">(MYR)</span>
              </span>
              <span className="text-mono-data text-xl font-bold text-on-surface">
                {formatMyr(price.total)}
              </span>
            </div>
            <p className="mt-1 text-right text-sm text-on-surface-variant">
              Includes taxes and fees
            </p>
            <div className="mt-6">
              <ConfirmButton payload={payload} />
            </div>
            <p className="mt-4 text-center text-sm text-on-surface-variant">
              By confirming this booking, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
