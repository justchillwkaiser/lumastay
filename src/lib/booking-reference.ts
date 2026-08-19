// Booking reference — spec §6: `LS-####` from Postgres sequence
// `booking_ref_seq` (see prisma/migrations/*_booking_ref_seq/migration.sql),
// unique, zero-padded to >= 4 digits. Callers inserting a Booking should
// retry on unique collision (defense in depth; sequence + unique index is
// the primary guarantee).

import { db } from "@/lib/db";

export async function nextBookingReference(): Promise<string> {
  const rows = await db.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('booking_ref_seq')
  `;
  const n = rows[0]?.nextval;
  if (n === undefined || n === null) {
    throw new Error("nextBookingReference: sequence returned no value");
  }
  return `LS-${n.toString().padStart(4, "0")}`;
}
