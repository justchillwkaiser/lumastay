// Guest account claim — plan 3 task 5 (phase-1-lite).
// When a GUEST user signs up/logs in, link any Guest rows whose email
// matches the user's email to that user account. Wiring into the login
// success flow lands with Task 12's login page.

import { db } from "@/lib/db";

export async function claimGuestBookings(
  userId: string,
  email: string,
): Promise<number> {
  try {
    const result = await db.guest.updateMany({
      where: { email: email.trim().toLowerCase(), userId: null },
      data: { userId },
    });
    return result.count;
  } catch {
    return 0; // offline dev — claim is best-effort, never blocks login
  }
}

export interface AccountBooking {
  reference: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: string;
}

export async function listBookingsForUser(
  userId: string,
): Promise<AccountBooking[]> {
  try {
    const rows = await db.booking.findMany({
      where: { guest: { userId } },
      include: { property: true },
      orderBy: { checkIn: "desc" },
    });
    return rows.map((row) => ({
      reference: row.reference,
      propertyName: row.property.name,
      checkIn: row.checkIn.toISOString().slice(0, 10),
      checkOut: row.checkOut.toISOString().slice(0, 10),
      status: row.status,
      totalAmount: row.totalAmount.toString(),
    }));
  } catch {
    return [];
  }
}
