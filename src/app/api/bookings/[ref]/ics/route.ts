import { notFound } from "next/navigation";

import { getBookingByReference } from "@/lib/booking-detail";
import { buildIcs } from "@/lib/ics";

// GET /api/bookings/[ref]/ics — plan 3 task 5. Streams the VEVENT as an
// .ics download (text/calendar + Content-Disposition attachment).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params;
  const booking = await getBookingByReference(ref);
  if (!booking) notFound();

  const ics = buildIcs({
    reference: booking.reference,
    propertyName: booking.propertyName,
    locationLine: booking.locationLine,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    checkInTime: booking.checkInTime,
    checkOutTime: booking.checkOutTime,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.reference}.ics"`,
    },
  });
}
