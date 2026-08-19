import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarBlank, Check } from "@phosphor-icons/react/dist/ssr";

import { BookingStepper } from "@/components/guest/booking/BookingStepper";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { getBookingByReference } from "@/lib/booking-detail";

export const metadata = { title: "Booking confirmed — LumaStay" };

const STEPS = ["Dates", "Guests", "Details", "Review", "Payment"];

function formatShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Step 5 — confirmed (plan 3 task 5). Dark rounded square + white Check
// (NOT green); booking reference card; ADD TO CALENDAR downloads the ICS.
export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : null;
  if (!ref) notFound();

  const booking = await getBookingByReference(ref);
  if (!booking) notFound();

  const guestLine = `${booking.adults} Adult${booking.adults === 1 ? "" : "s"}${
    booking.children > 0
      ? `, ${booking.children} Child${booking.children === 1 ? "" : "ren"}`
      : ""
  }`;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10 lg:py-16">
      <div className="flex justify-center">
        <BookingStepper step={5} variant="circle" steps={STEPS} />
      </div>

      <div className="mx-auto mt-12 max-w-[560px] text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
          <Check size={28} strokeWidth={2.5} className="text-on-primary" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
          Confirmed
        </h1>
        <p className="mt-3 text-body-md text-on-surface-variant">
          Your sanctuary awaits. Check-in instructions will be sent to your
          email closer to your arrival date.
        </p>
      </div>

      <Card className="mx-auto mt-10 max-w-[720px] p-6 lg:p-8">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr]">
          {/* Left: reference / property / guest */}
          <div className="space-y-5">
            <div>
              <LabelCaps as="span" className="block">
                Booking reference
              </LabelCaps>
              <p className="mt-1 text-mono-data text-lg font-bold text-on-surface">
                #{booking.reference}
              </p>
            </div>
            <div>
              <LabelCaps as="span" className="block">
                Property
              </LabelCaps>
              <p className="mt-1 text-sm font-semibold text-on-surface">
                {booking.propertyName}
              </p>
              <p className="text-sm text-on-surface-variant">
                {booking.locationLine}
              </p>
            </div>
            <div>
              <LabelCaps as="span" className="block">
                Guest
              </LabelCaps>
              <p className="mt-1 text-sm text-on-surface">{booking.guestName}</p>
              <p className="text-sm text-on-surface-variant">
                {booking.guestEmail}
              </p>
            </div>
          </div>

          <span aria-hidden="true" className="hidden w-px bg-hairline sm:block" />

          {/* Right: dates / guests */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div>
                <LabelCaps as="span" className="block">
                  Check in
                </LabelCaps>
                <p className="mt-1 text-base font-bold text-on-surface">
                  {formatShort(booking.checkIn)}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {booking.checkInTime}
                </p>
              </div>
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className="mt-4 text-on-surface-variant" />
              <div>
                <LabelCaps as="span" className="block">
                  Check out
                </LabelCaps>
                <p className="mt-1 text-base font-bold text-on-surface">
                  {formatShort(booking.checkOut)}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {booking.checkOutTime}
                </p>
              </div>
            </div>
            <Divider />
            <div>
              <LabelCaps as="span" className="block">
                Guests
              </LabelCaps>
              <p className="mt-1 text-sm text-on-surface">{guestLine}</p>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`/api/bookings/${booking.reference}/ics`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-tertiary px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-tertiary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <CalendarBlank size={16} strokeWidth={1.5} aria-hidden="true" />
            Add to calendar
          </a>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-outline-variant bg-transparent px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Return to discovery
          </Link>
        </div>
      </Card>
    </div>
  );
}
