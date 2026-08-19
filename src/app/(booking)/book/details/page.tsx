import { notFound, redirect } from "next/navigation";

import { BookingStepper } from "@/components/guest/booking/BookingStepper";
import { SummaryCard } from "@/components/guest/booking/SummaryCard";
import {
  bookingParamsToSearch,
  parseBookingParams,
  requireParamsFor,
  type BookingParams,
} from "@/lib/booking-params";
import { computePrice } from "@/lib/pricing";
import { getPropertyBySlug } from "@/lib/properties";
import { DetailsForm } from "./DetailsForm";

export const metadata = { title: "Your details — LumaStay" };

const STEPS = ["Dates", "Guests", "Details", "Review", "Payment"];

function nightsOf(params: BookingParams): number {
  if (!params.checkIn || !params.checkOut) return 0;
  const ms =
    new Date(`${params.checkOut}T00:00:00Z`).getTime() -
    new Date(`${params.checkIn}T00:00:00Z`).getTime();
  return Math.round(ms / 86400000);
}

// Step 3 — details (plan 3 task 3). Step guard; form values are carried
// forward as URL params on submit so /book/review remains RSC.
export default async function DetailsPage({
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
    requireParamsFor("details", params);
  } catch (e) {
    redirect((e as Error).message.replace("REDIRECT:", ""));
  }

  const property = await getPropertyBySlug(params.property ?? "the-pavilion");
  if (!property) notFound();

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

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10 lg:py-16">
      <BookingStepper step={3} variant="text" steps={STEPS} />
      <h1 className="mt-8 text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Your details
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <DetailsForm
          defaults={{
            name: params.name ?? "",
            email: params.email ?? "",
            phone: params.phone ?? "",
            requests: params.requests ?? "",
          }}
          baseSearch={bookingParamsToSearch({
            ...params,
            name: null,
            email: null,
            phone: null,
            requests: null,
          })}
        />
        <SummaryCard property={property} params={params} breakdown={breakdown} />
      </div>
    </div>
  );
}
