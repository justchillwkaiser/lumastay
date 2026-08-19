"use server";

import { getBookingByReferenceAndEmail } from "@/lib/booking-detail";

// Server action for /bookings/lookup — plan 3 task 5. Returns a plain
// serializable result (RSC action boundary cannot throw to the client).
export interface LookupResult {
  found: boolean;
  booking?: Awaited<ReturnType<typeof getBookingByReferenceAndEmail>>;
}

export async function lookupBooking(
  reference: string,
  email: string,
): Promise<LookupResult> {
  const booking = await getBookingByReferenceAndEmail(reference, email);
  return { found: booking !== null, booking: booking ?? undefined };
}
