"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { LabelCaps } from "@/components/ui/LabelCaps";
import type { BookingDetail } from "@/lib/booking-detail";
import { lookupBooking } from "./actions";

function formatShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Lookup form (plan 3 task 5): ref + email → server action → read-only
// detail card. Error line verbatim per plan.
export function LookupForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const reference = String(data.get("reference") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    setError(null);
    startTransition(async () => {
      const result = await lookupBooking(reference, email);
      if (!result.found || !result.booking) {
        setBooking(null);
        setError("No booking found for that reference and email.");
        return;
      }
      setBooking(result.booking);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mx-auto max-w-[420px] space-y-6">
        <Input label="Booking reference" name="reference" placeholder="LS-1024" required />
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Searching…" : "Find booking"}
        </Button>
        {error && (
          <p className="text-label-caps text-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {booking && (
        <Card className="mx-auto mt-10 max-w-[560px] p-6">
          <LabelCaps as="span" className="block">
            Booking reference
          </LabelCaps>
          <p className="mt-1 text-mono-data text-lg font-bold text-on-surface">
            #{booking.reference}
          </p>
          <Divider className="my-5" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <LabelCaps as="span" className="block">Property</LabelCaps>
              <p className="mt-1 text-sm text-on-surface">{booking.propertyName}</p>
              <p className="text-sm text-on-surface-variant">{booking.locationLine}</p>
            </div>
            <div>
              <LabelCaps as="span" className="block">Status</LabelCaps>
              <p className="mt-1 text-sm text-on-surface">{booking.status}</p>
            </div>
            <div>
              <LabelCaps as="span" className="block">Check-in</LabelCaps>
              <p className="mt-1 text-sm text-on-surface">
                {formatShort(booking.checkIn)} · {booking.checkInTime}
              </p>
            </div>
            <div>
              <LabelCaps as="span" className="block">Check-out</LabelCaps>
              <p className="mt-1 text-sm text-on-surface">
                {formatShort(booking.checkOut)} · {booking.checkOutTime}
              </p>
            </div>
            <div>
              <LabelCaps as="span" className="block">Guests</LabelCaps>
              <p className="mt-1 text-sm text-on-surface">
                {booking.adults} Adult{booking.adults === 1 ? "" : "s"}
                {booking.children > 0
                  ? `, ${booking.children} Child${booking.children === 1 ? "" : "ren"}`
                  : ""}
              </p>
            </div>
            <div>
              <LabelCaps as="span" className="block">Total</LabelCaps>
              <p className="mt-1 text-mono-data text-on-surface">
                RM {Number(booking.totalAmount).toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <Divider className="my-5" />
          <a
            href={`/api/bookings/${booking.reference}/ics`}
            className="text-sm font-semibold text-on-surface underline underline-offset-4 transition-colors hover:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Add to calendar
          </a>
        </Card>
      )}
    </div>
  );
}
