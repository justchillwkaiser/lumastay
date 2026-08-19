// Booking creation — plan 3 task 4, spec FR-1.
// The server is the single guard: input is zod-validated, capacity checked,
// availability re-verified (fail-closed), and the price ALWAYS recomputed
// from the Property rates — client totals are never trusted.

import { z } from "zod";

import { isRangeBookable } from "@/lib/availability";
import { nextBookingReference } from "@/lib/booking-reference";
import { db } from "@/lib/db";
import { computePrice } from "@/lib/pricing";
import { getPropertyBySlug } from "@/lib/properties";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const createBookingSchema = z.object({
  property: z.string().min(1),
  checkIn: z.string().regex(DATE_RE),
  checkOut: z.string().regex(DATE_RE),
  adults: z.number().int().min(1).max(16),
  children: z.number().int().min(0).max(10),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+60[\d\s-]{8,}$/),
  specialRequests: z.string().max(500).optional().default(""),
  // Deliberately NOT trusted: present only so tests can prove it is ignored.
  clientTotal: z.string().optional(),
});

export type CreateBookingInput = z.input<typeof createBookingSchema>;

// The API route receives loosely-typed JSON (strings from the URL-carried
// flow); the route coerces and zod validates. `unknown` keeps the route
// honest — createBooking re-validates everything anyway.
export type CreateBookingPayload = Record<string, unknown>;

export type CreateBookingResult =
  | { reference: string }
  | { error: string };

export async function createBooking(
  raw: unknown,
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) return { error: "INVALID_INPUT" };
  const input = parsed.data;

  const property = await getPropertyBySlug(input.property);
  if (!property) return { error: "PROPERTY_NOT_FOUND" };

  if (input.adults + input.children > property.maxGuests) {
    return { error: "OVER_CAPACITY" };
  }

  const nights = Math.round(
    (new Date(`${input.checkOut}T00:00:00Z`).getTime() -
      new Date(`${input.checkIn}T00:00:00Z`).getTime()) /
      86400000,
  );
  if (nights < 1) return { error: "INVALID_DATES" };

  // Fail-closed availability guard (DB error => not bookable).
  const bookable = await isRangeBookable(
    property.slug,
    input.checkIn,
    input.checkOut,
  );
  if (!bookable) return { error: "DATES_UNAVAILABLE" };

  // Server-side recompute — the ONLY price that matters.
  const price = computePrice(
    {
      nightlyRate: property.nightlyRate,
      cleaningFee: property.cleaningFee,
      serviceFeePct: property.serviceFeePct,
      taxPct: property.taxPct,
    },
    nights,
  );

  const reference = await nextBookingReference();

  try {
    await db.$transaction(async (tx) => {
      const guest = await tx.guest.upsert({
        where: { email: input.email },
        create: { name: input.name, email: input.email, phone: input.phone },
        update: { name: input.name, phone: input.phone },
      });
      const booking = await tx.booking.create({
        data: {
          reference,
          propertyId: (property as { id?: string }).id ?? property.slug,
          guestId: guest.id,
          checkIn: new Date(`${input.checkIn}T00:00:00Z`),
          checkOut: new Date(`${input.checkOut}T00:00:00Z`),
          nights,
          adults: input.adults,
          children: input.children,
          status: "PENDING",
          nightlyRate: price.nightlyRate,
          cleaningFee: price.cleaningFee,
          serviceFee: price.serviceFee,
          taxAmount: price.taxAmount,
          totalAmount: price.total,
          specialRequests: input.specialRequests || null,
          source: "Direct Website",
        },
      });
      // Phase-1 mock payment row (Task 6 upgrades status via provider).
      // Optional per plan interface: only created when the payment model is
      // available on the transaction client.
      const paymentModel = (tx as { payment?: { create: (a: unknown) => Promise<unknown> } }).payment;
      if (paymentModel) {
        await paymentModel.create({
          data: {
            bookingId: booking.id,
            amount: price.total,
            method: "mock-fpx",
            status: "PENDING",
          },
        });
      }
    });
  } catch (e) {
    // Postgres exclusion constraint violation (23J01) — two concurrent
    // requests both passed isRangeBookable, but the DB-level constraint
    // `no_overlapping_bookings` rejects the second insert atomically.
    // Surface it as the same user-facing code as the pre-check.
    const code = (e as { code?: string }).code;
    if (code === "23J01") return { error: "DATES_UNAVAILABLE" };
    throw e;
  }

  return { reference };
}
