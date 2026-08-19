// Admin booking detail + mutations — plan 3 task 9.
// Every mutation writes an InternalNote timeline entry (author + timestamp)
// inside the same transaction as the state change.

import { db } from "@/lib/db";

export interface AdminBookingDetail {
  id: string;
  reference: string;
  status: string;
  createdAt: string;
  source: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  specialRequests: string | null;
  nightlyRate: string;
  cleaningFee: string;
  serviceFee: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  guest: {
    name: string;
    email: string;
    phone: string;
    bookingCount: number;
  };
  property: {
    name: string;
    shortName: string;
    locationLine: string;
    cardImage: string | null;
    maxGuests: number;
    beds: number;
    checkInTime: string;
    checkOutTime: string;
  };
  notes: { id: string; body: string; authorId: string; createdAt: string }[];
}

type Row = NonNullable<Awaited<ReturnType<typeof fetchRow>>>;

async function fetchRow(id: string) {
  return db.booking.findUnique({
    where: { id },
    include: {
      guest: { include: { _count: { select: { bookings: true } } } },
      property: { include: { images: { where: { role: "card" }, take: 1 } } },
      payments: true,
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
}

function toDetail(row: Row): AdminBookingDetail {
  const paid = row.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    source: row.source,
    checkIn: row.checkIn.toISOString().slice(0, 10),
    checkOut: row.checkOut.toISOString().slice(0, 10),
    nights: row.nights,
    adults: row.adults,
    children: row.children,
    specialRequests: row.specialRequests,
    nightlyRate: row.nightlyRate.toString(),
    cleaningFee: row.cleaningFee.toString(),
    serviceFee: row.serviceFee.toString(),
    taxAmount: row.taxAmount.toString(),
    totalAmount: row.totalAmount.toString(),
    paidAmount: paid.toFixed(2),
    guest: {
      name: row.guest.name,
      email: row.guest.email,
      phone: row.guest.phone,
      bookingCount: row.guest._count.bookings,
    },
    property: {
      name: row.property.name,
      shortName: row.property.shortName,
      locationLine: row.property.locationLine,
      cardImage: row.property.images[0]?.url ?? null,
      maxGuests: row.property.maxGuests,
      beds: row.property.beds,
      checkInTime: row.property.checkInTime,
      checkOutTime: row.property.checkOutTime,
    },
    notes: row.notes.map((n) => ({
      id: n.id,
      body: n.body,
      authorId: n.authorId,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

export async function getBookingDetail(
  id: string,
): Promise<AdminBookingDetail | null> {
  try {
    const row = await fetchRow(id);
    return row ? toDetail(row) : null;
  } catch {
    return null;
  }
}

async function timelineNote(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  bookingId: string,
  body: string,
  authorId: string,
) {
  await tx.internalNote.create({ data: { bookingId, body, authorId } });
}

export async function confirmBooking(id: string, authorId: string) {
  await db.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
    await timelineNote(tx, id, "Booking confirmed", authorId);
  });
}

export async function cancelBooking(id: string, authorId: string) {
  // Availability auto-frees: the engine only blocks PENDING/CONFIRMED, so a
  // CANCELLED booking releases its range immediately (isRangeBookable).
  await db.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
    await timelineNote(tx, id, "Booking cancelled", authorId);
  });
}

export interface RecordPaymentInput {
  amount: string;
  method: string;
  note?: string;
}

export async function recordPayment(
  id: string,
  input: RecordPaymentInput,
  authorId: string,
) {
  // Fetch the booking first (its total is the fully-paid threshold); the
  // transaction then only needs payment.create/aggregate + booking.update.
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) throw new Error(`Booking ${id} not found`);

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        bookingId: id,
        amount: input.amount,
        method: input.method,
        status: "PAID",
        recordedBy: authorId,
        paidAt: new Date(),
      },
    });
    const paid = await tx.payment.aggregate({
      _sum: { amount: true },
      where: { bookingId: id, status: "PAID" },
    });
    if (Number(paid._sum.amount ?? 0) >= Number(booking.totalAmount)) {
      await tx.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
    }
    await timelineNote(
      tx,
      id,
      `Payment recorded: RM ${input.amount} via ${input.method}${input.note ? ` — ${input.note}` : ""}`,
      authorId,
    );
  });
}

export async function addNote(id: string, body: string, authorId: string) {
  await db.internalNote.create({ data: { bookingId: id, body, authorId } });
}
