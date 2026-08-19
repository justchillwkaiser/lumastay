// Booking detail lookup by reference — plan 3 task 5.
// Offline/demo fallback: the dev machine has no local Postgres, so the
// seeded demo booking LS-1024 resolves without the DB (same contract as
// the Plan 1 seed-fallback pattern).

import { db } from "@/lib/db";
import { fallbackProperties } from "@/lib/seed-fallback";

export interface BookingDetail {
  reference: string;
  propertyName: string;
  shortName: string;
  locationLine: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  totalAmount: string;
  status: string;
}

const pavilion = fallbackProperties[0];

// Demo booking rendered when the DB is unreachable (confirmed page must
// still paint during offline dev).
export const demoBooking: BookingDetail = {
  reference: "LS-1024",
  propertyName: pavilion.name,
  shortName: pavilion.shortName,
  locationLine: pavilion.locationLine,
  checkIn: "2024-11-12",
  checkOut: "2024-11-18",
  checkInTime: pavilion.checkInTime,
  checkOutTime: pavilion.checkOutTime,
  nights: 6,
  adults: 2,
  children: 0,
  guestName: "Alexander Wright",
  guestEmail: "a.wright@example.com",
  totalAmount: "20760.00",
  status: "CONFIRMED",
};

function toDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getBookingByReference(
  reference: string,
): Promise<BookingDetail | null> {
  try {
    const row = await db.booking.findUnique({
      where: { reference },
      include: { property: true, guest: true },
    });
    if (!row) {
      return reference === demoBooking.reference ? demoBooking : null;
    }
    return {
      reference: row.reference,
      propertyName: row.property.name,
      shortName: row.property.shortName,
      locationLine: row.property.locationLine,
      checkIn: toDay(row.checkIn),
      checkOut: toDay(row.checkOut),
      checkInTime: row.property.checkInTime,
      checkOutTime: row.property.checkOutTime,
      nights: row.nights,
      adults: row.adults,
      children: row.children,
      guestName: row.guest.name,
      guestEmail: row.guest.email,
      totalAmount: row.totalAmount.toString(),
      status: row.status,
    };
  } catch {
    return reference === demoBooking.reference ? demoBooking : null;
  }
}

/** Lookup guard: reference + email must match (used by /bookings/lookup). */
export async function getBookingByReferenceAndEmail(
  reference: string,
  email: string,
): Promise<BookingDetail | null> {
  const booking = await getBookingByReference(reference);
  if (!booking) return null;
  return booking.guestEmail.toLowerCase() === email.trim().toLowerCase()
    ? booking
    : null;
}
