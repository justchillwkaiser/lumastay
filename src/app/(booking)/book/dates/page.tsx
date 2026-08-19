import { notFound } from "next/navigation";

import { BookingStepper } from "@/components/guest/booking/BookingStepper";
import { StepTransition } from "@/components/guest/booking/StepTransition";
import { SummaryCard } from "@/components/guest/booking/SummaryCard";
import { getDateStates } from "@/lib/availability";
import {
  bookingParamsToSearch,
  parseBookingParams,
  type BookingParams,
} from "@/lib/booking-params";
import { computePrice } from "@/lib/pricing";
import { getPropertyBySlug } from "@/lib/properties";
import { ContinueButton } from "./ContinueButton";
import { DatesPickerClient } from "./DatesPickerClient";

export const metadata = { title: "Select your dates — LumaStay" };

const STEPS = ["Dates", "Guests", "Details", "Review", "Payment"];

function nightsOf(params: BookingParams): number {
  if (!params.checkIn || !params.checkOut) return 0;
  const ms =
    new Date(`${params.checkOut}T00:00:00Z`).getTime() -
    new Date(`${params.checkIn}T00:00:00Z`).getTime();
  return Math.round(ms / 86400000);
}

// Step 1 — dates (plan 3 task 3). RSC: awaits searchParams, resolves the
// property (fallback the-pavilion), pulls availability states for the
// visible month, and recomputes the price server-side. The picker itself is
// a client leaf that navigates the URL on every selection.
export default async function DatesPage({
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

  const property = await getPropertyBySlug(params.property ?? "the-pavilion");
  if (!property) notFound();

  // Visible month: check-in month if present, else current month.
  const anchor = params.checkIn ? new Date(`${params.checkIn}T00:00:00Z`) : new Date();
  const month = { year: anchor.getUTCFullYear(), month: anchor.getUTCMonth() + 1 };
  const states = await getDateStates(property.slug, month.year, month.month);

  const nights = nightsOf(params);
  const breakdown =
    nights > 0
      ? computePrice(
          {
            nightlyRate: property.nightlyRate,
            cleaningFee: property.cleaningFee,
            serviceFeePct: property.serviceFeePct,
            taxPct: property.taxPct,
          },
          nights,
        )
      : null;

  const base = bookingParamsToSearch({ ...params, checkIn: null, checkOut: null });
  const nextSearch = bookingParamsToSearch(params);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10 lg:py-16">
      <BookingStepper step={1} variant="text" steps={STEPS} />
      <h1 className="mt-8 text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Select your dates
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <StepTransition className="max-w-[420px]">
          <DatesPickerClient
            month={month}
            states={states}
            value={{ checkIn: params.checkIn, checkOut: params.checkOut }}
            baseSearch={base}
          />
        </StepTransition>
        <SummaryCard property={property} params={params} breakdown={breakdown}>
          <ContinueButton
            href={`/book/guests?${nextSearch}`}
            enabled={nights > 0}
          />
        </SummaryCard>
      </div>
    </div>
  );
}
