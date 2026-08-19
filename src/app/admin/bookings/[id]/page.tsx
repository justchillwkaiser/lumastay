import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, UserCircle } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import { getBookingDetail } from "@/lib/admin-booking-detail";
import { formatMyr } from "@/lib/format";
import { AddNoteForm, BookingActions } from "./BookingActions";

export const metadata = { title: "Booking detail — LumaStay Admin" };

function tone(status: string): "confirmed" | "pending" | "cancelled" {
  if (status === "CONFIRMED" || status === "COMPLETED") return "confirmed";
  if (status === "PENDING") return "pending";
  return "cancelled";
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Admin Booking Detail (plan 3 task 9): header + actions; 65/35 grid —
// guest / property / stay cards left; payment summary, internal notes,
// cancel right.
export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingDetail(id);
  if (!booking) notFound();

  const unpaid = Number(booking.paidAmount) < Number(booking.totalAmount);

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
              Booking {booking.reference}
            </h1>
            <Badge tone={tone(booking.status)}>{booking.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            Created on {new Date(booking.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            via {booking.source}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[65fr_35fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Card className="p-6">
            <LabelCaps as="span" className="block">Guest Information</LabelCaps>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded bg-surface-container text-on-surface">
                <UserCircle size={28} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {booking.guest.name}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {booking.guest.email} · {booking.guest.phone}
                </p>
                {booking.guest.bookingCount >= 2 && (
                  <p className="mt-1 text-label-caps text-primary">
                    Returning Guest
                  </p>
                )}
              </div>
            </div>
            <a
              href={`mailto:${booking.guest.email}`}
              className="mt-4 inline-block text-sm font-semibold text-on-surface underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Contact Guest
            </a>
          </Card>

          <Card className="p-6">
            <LabelCaps as="span" className="block">Property</LabelCaps>
            <div className="mt-4 flex items-center gap-4">
              {booking.property.cardImage && (
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={booking.property.cardImage}
                    alt={booking.property.shortName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {booking.property.name}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {booking.property.locationLine}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Up to {booking.property.maxGuests} guests · {booking.property.beds} beds
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <LabelCaps as="span" className="block">Stay Details</LabelCaps>
            <div className="mt-4 flex items-center gap-6">
              <div>
                <LabelCaps as="span" className="block">Check-in</LabelCaps>
                <p className="mt-1 text-base font-bold text-on-surface">
                  {fmtDate(booking.checkIn)}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {booking.property.checkInTime}
                </p>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="h-px w-8 bg-hairline" aria-hidden="true" />
                <span className="text-label-caps">{booking.nights} N</span>
                <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <LabelCaps as="span" className="block">Check-out</LabelCaps>
                <p className="mt-1 text-base font-bold text-on-surface">
                  {fmtDate(booking.checkOut)}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {booking.property.checkOutTime}
                </p>
              </div>
            </div>
            <Divider className="my-5" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <LabelCaps as="span" className="block">Occupancy</LabelCaps>
                <p className="mt-1 text-sm text-on-surface">
                  {booking.adults} Adult{booking.adults === 1 ? "" : "s"}
                  {booking.children > 0
                    ? `, ${booking.children} Child${booking.children === 1 ? "" : "ren"}`
                    : ""}
                </p>
              </div>
              {booking.specialRequests && (
                <div>
                  <LabelCaps as="span" className="block">Special Requests</LabelCaps>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card className="p-6">
            <LabelCaps as="span" className="block">Payment Summary</LabelCaps>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface">
                  {formatMyr(booking.nightlyRate)} × {booking.nights} night{booking.nights === 1 ? "" : "s"}
                </span>
                <span className="text-mono-data text-on-surface">
                  {formatMyr((Number(booking.nightlyRate) * booking.nights).toFixed(2))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface">Cleaning fee</span>
                <span className="text-mono-data text-on-surface">{formatMyr(booking.cleaningFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface">Service fee</span>
                <span className="text-mono-data text-on-surface">{formatMyr(booking.serviceFee)}</span>
              </div>
            </div>
            <Divider className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-on-surface">Total</span>
              <span className="text-mono-data text-lg font-bold text-on-surface">
                {formatMyr(booking.totalAmount)}
              </span>
            </div>
            <p className={`mt-1 text-right text-sm ${unpaid ? "text-error" : "text-on-surface-variant"}`}>
              {unpaid ? "Unpaid" : "Paid in full"}
            </p>
            <div className="mt-4">
              <BookingActions id={booking.id} status={booking.status} unpaid={unpaid} />
            </div>
          </Card>

          <Card className="p-6">
            <LabelCaps as="span" className="block">Internal Notes</LabelCaps>
            <div className="mt-4 space-y-4">
              {booking.notes.length === 0 && (
                <p className="text-sm text-on-surface-variant">No notes yet.</p>
              )}
              {booking.notes.map((note) => (
                <div key={note.id} className="rounded bg-surface-container-low p-3">
                  <p className="text-sm text-on-surface">{note.body}</p>
                  <p className="mt-2 text-label-caps text-on-surface-variant">
                    Added by: {note.authorId} (
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    )
                  </p>
                </div>
              ))}
            </div>
            <AddNoteForm id={booking.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}
