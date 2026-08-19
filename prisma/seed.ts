// Idempotent full seed for LumaStay (Plan 1, Task 5).
//
// Wipes all tables in FK order, then inserts: 4 properties (same data as
// src/lib/seed-fallback.ts — verbatim spec §8 copy), admin + staff users
// (Better Auth credential accounts, hash via hashPassword from
// better-auth/crypto), 3 guests, 20 bookings across statuses/dates,
// 3 availability blocks, payments matching bookings, 6 approved reviews,
// and an internal note on LS-1042.
//
// Run: npx prisma db seed   (requires a live DATABASE_URL)

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { fallbackProperties } from "../src/lib/seed-fallback";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

// --- date helpers -----------------------------------------------------------

function atLocalMidnight(daysFromNow: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

/** Fixed Aug-of-current-year date for mockup-calendar blocks (Aug 2/3-4/6-7). */
function aug(day: number): Date {
  return new Date(new Date().getFullYear(), 7, day);
}

// --- pricing ----------------------------------------------------------------

const CLEANING_FEE = 400;
const SERVICE_FEE_PCT = 0.05;

function money(n: number): string {
  return n.toFixed(2);
}

function totals(nightlyRate: number, nights: number) {
  const cleaningFee = CLEANING_FEE;
  const serviceFee = nightlyRate * nights * SERVICE_FEE_PCT;
  return {
    cleaningFee: money(cleaningFee),
    serviceFee: money(serviceFee),
    taxAmount: money(0),
    totalAmount: money(nightlyRate * nights + cleaningFee + serviceFee),
  };
}

// --- main -------------------------------------------------------------------

async function main() {
  // 1) Wipe in FK order (children → parents) so the seed is idempotent.
  await db.internalNote.deleteMany();
  await db.payment.deleteMany();
  await db.review.deleteMany();
  await db.availabilityBlock.deleteMany();
  await db.booking.deleteMany();
  await db.propertySpec.deleteMany();
  await db.propertyImage.deleteMany();
  await db.amenity.deleteMany();
  await db.property.deleteMany();
  await db.guest.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.verification.deleteMany();
  await db.user.deleteMany();

  // 2) Properties (same data as the offline fallback module).
  const propertyIds = new Map<string, string>();
  for (const p of fallbackProperties) {
    const created = await db.property.create({
      data: {
        slug: p.slug,
        name: p.name,
        shortName: p.shortName,
        locationLine: p.locationLine,
        description: p.description,
        nightlyRate: p.nightlyRate,
        maxGuests: p.maxGuests,
        bedrooms: p.bedrooms,
        beds: p.beds,
        baths: p.baths,
        areaSqft: p.areaSqft,
        architecture: p.architecture,
        materials: p.materials,
        amenities: {
          create: p.amenities.map((a, i) => ({ ...a, sortOrder: i })),
        },
        specs: {
          create: p.specs.map((s, i) => ({ ...s, sortOrder: i })),
        },
        images: {
          create: [
            { url: p.cardImage, alt: `${p.name} — exterior`, role: "card", sortOrder: 0 },
            { url: p.heroImage, alt: `${p.name} — hero`, role: "hero", sortOrder: 1 },
          ],
        },
      },
    });
    propertyIds.set(p.slug, created.id);
  }
  const pid = (slug: string) => propertyIds.get(slug)!;

  // 3) Users (Better Auth credential accounts).
  const adminHash = await hashPassword("lumastay-admin-2026");
  const staffHash = await hashPassword("lumastay-staff-2026");

  const admin = await db.user.create({
    data: {
      name: "Sarah L.",
      email: "admin@lumastay.my",
      emailVerified: true,
      role: "ADMIN",
      accounts: {
        create: {
          accountId: "admin@lumastay.my",
          providerId: "credential",
          password: adminHash,
        },
      },
    },
  });

  const staff = await db.user.create({
    data: {
      name: "Staff LumaStay",
      email: "staff@lumastay.my",
      emailVerified: true,
      role: "STAFF",
      accounts: {
        create: {
          accountId: "staff@lumastay.my",
          providerId: "credential",
          password: staffHash,
        },
      },
    },
  });

  // 4) Guests.
  const guests = await Promise.all(
    [
      { name: "Ahmad Aiman", email: "ahmad.aiman@example.com", phone: "+60123456701" },
      { name: "Smith Family", email: "smith.family@example.com", phone: "+60123456702" },
      { name: "Mei Lin Tan", email: "meilin.tan@example.com", phone: "+60123456703" },
    ].map((g) => db.guest.create({ data: g })),
  );
  const [ahmad, smith, meilin] = guests;

  // 5) Bookings (20) — spread across statuses/dates; 2 check in TODAY for the
  //    IMPORTANT TODAY card (Ahmad Aiman at The Pavilion, 2 guests, 3:00 PM).
  type BookingSeed = {
    ref: string;
    slug: string;
    guestId: string;
    inDays: number;
    outDays: number;
    adults: number;
    children?: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    requests?: string;
    source?: string;
  };

  const bookingSeeds: BookingSeed[] = [
    // IMPORTANT TODAY — 2 checking in today.
    { ref: "LS-1042", slug: "the-pavilion", guestId: ahmad.id, inDays: 0, outDays: 2, adults: 2, status: "CONFIRMED", requests: "Extra pillows please." },
    { ref: "LS-1043", slug: "courtyard-house", guestId: meilin.id, inDays: 0, outDays: 3, adults: 2, children: 1, status: "CONFIRMED" },
    // Upcoming.
    { ref: "LS-1044", slug: "the-horizon-villa", guestId: smith.id, inDays: 3, outDays: 7, adults: 4, children: 2, status: "CONFIRMED" },
    { ref: "LS-1045", slug: "limestone-retreat", guestId: ahmad.id, inDays: 5, outDays: 8, adults: 2, status: "PENDING" },
    { ref: "LS-1046", slug: "the-pavilion", guestId: smith.id, inDays: 9, outDays: 12, adults: 6, status: "CONFIRMED" },
    { ref: "LS-1047", slug: "courtyard-house", guestId: ahmad.id, inDays: 10, outDays: 11, adults: 2, status: "PENDING" },
    { ref: "LS-1048", slug: "the-horizon-villa", guestId: meilin.id, inDays: 14, outDays: 18, adults: 3, status: "CONFIRMED" },
    { ref: "LS-1049", slug: "limestone-retreat", guestId: smith.id, inDays: 16, outDays: 19, adults: 4, status: "PENDING" },
    { ref: "LS-1050", slug: "the-pavilion", guestId: meilin.id, inDays: 21, outDays: 24, adults: 5, children: 1, status: "CONFIRMED" },
    { ref: "LS-1051", slug: "courtyard-house", guestId: smith.id, inDays: 25, outDays: 28, adults: 2, status: "CANCELLED" },
    // Current stay (checked in yesterday).
    { ref: "LS-1052", slug: "limestone-retreat", guestId: meilin.id, inDays: -1, outDays: 2, adults: 2, status: "CONFIRMED" },
    // Past stays.
    { ref: "LS-1053", slug: "the-pavilion", guestId: ahmad.id, inDays: -30, outDays: -27, adults: 8, status: "COMPLETED" },
    { ref: "LS-1054", slug: "the-horizon-villa", guestId: meilin.id, inDays: -25, outDays: -22, adults: 2, status: "COMPLETED" },
    { ref: "LS-1055", slug: "courtyard-house", guestId: smith.id, inDays: -20, outDays: -17, adults: 3, children: 2, status: "COMPLETED" },
    { ref: "LS-1056", slug: "limestone-retreat", guestId: ahmad.id, inDays: -15, outDays: -12, adults: 4, status: "COMPLETED" },
    { ref: "LS-1057", slug: "the-pavilion", guestId: smith.id, inDays: -14, outDays: -11, adults: 2, status: "CANCELLED" },
    { ref: "LS-1058", slug: "the-horizon-villa", guestId: ahmad.id, inDays: -10, outDays: -7, adults: 6, status: "COMPLETED" },
    { ref: "LS-1059", slug: "courtyard-house", guestId: meilin.id, inDays: -8, outDays: -5, adults: 2, status: "COMPLETED" },
    { ref: "LS-1060", slug: "limestone-retreat", guestId: smith.id, inDays: -5, outDays: -3, adults: 5, status: "CANCELLED" },
    { ref: "LS-1061", slug: "the-horizon-villa", guestId: smith.id, inDays: 30, outDays: 34, adults: 2, status: "PENDING" },
  ];

  const rateBySlug = new Map(fallbackProperties.map((p) => [p.slug, Number(p.nightlyRate)]));

  const bookingIds = new Map<string, string>();
  for (const b of bookingSeeds) {
    const nights = b.outDays - b.inDays;
    const nightly = rateBySlug.get(b.slug)!;
    const t = totals(nightly, nights);
    const created = await db.booking.create({
      data: {
        reference: b.ref,
        propertyId: pid(b.slug),
        guestId: b.guestId,
        checkIn: atLocalMidnight(b.inDays),
        checkOut: atLocalMidnight(b.outDays),
        nights,
        adults: b.adults,
        children: b.children ?? 0,
        status: b.status,
        nightlyRate: money(nightly),
        cleaningFee: t.cleaningFee,
        serviceFee: t.serviceFee,
        taxAmount: t.taxAmount,
        totalAmount: t.totalAmount,
        specialRequests: b.requests ?? null,
        source: b.source ?? "Direct Website",
      },
    });
    bookingIds.set(b.ref, created.id);
  }

  // 6) Availability blocks — mockup calendar (Aug of current year):
  //    Smith Family booking Aug 3–4 · "Hold: Corp Retreat" HOLD Aug 6–7 ·
  //    one BLOCKED Aug 2 (maintenance).
  await db.availabilityBlock.create({
    data: {
      propertyId: pid("the-pavilion"),
      startDate: aug(2),
      endDate: aug(3),
      type: "BLOCKED",
      label: "Maintenance",
      createdBy: admin.id,
    },
  });
  await db.availabilityBlock.create({
    data: {
      propertyId: pid("the-pavilion"),
      startDate: aug(6),
      endDate: aug(8),
      type: "HOLD",
      label: "Hold: Corp Retreat",
      createdBy: admin.id,
    },
  });
  // The Smith Family Aug 3–4 calendar cell is a real BOOKED booking.
  await db.booking.create({
    data: {
      reference: "LS-1062",
      propertyId: pid("the-pavilion"),
      guestId: smith.id,
      checkIn: aug(3),
      checkOut: aug(4),
      nights: 1,
      adults: 4,
      status: "CONFIRMED",
      nightlyRate: money(rateBySlug.get("the-pavilion")!),
      ...totals(rateBySlug.get("the-pavilion")!, 1),
    },
  });

  // 7) Payments matching bookings — PAID for CONFIRMED/COMPLETED, PENDING for
  //    PENDING, REFUNDED for CANCELLED.
  const allBookings = await db.booking.findMany({
    select: { id: true, reference: true, status: true, totalAmount: true },
  });
  for (const b of allBookings) {
    if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
      await db.payment.create({
        data: {
          bookingId: b.id,
          amount: b.totalAmount,
          method: "mock-fpx",
          reference: `FPX-${b.reference}`,
          status: "PAID",
          recordedBy: admin.id,
          paidAt: new Date(),
        },
      });
    } else if (b.status === "PENDING") {
      await db.payment.create({
        data: {
          bookingId: b.id,
          amount: b.totalAmount,
          method: "mock-fpx",
          status: "PENDING",
        },
      });
    } else if (b.status === "CANCELLED") {
      await db.payment.create({
        data: {
          bookingId: b.id,
          amount: b.totalAmount,
          method: "mock-fpx",
          reference: `FPX-${b.reference}`,
          status: "REFUNDED",
          recordedBy: admin.id,
          paidAt: new Date(),
        },
      });
    }
  }

  // 8) Reviews (6 approved) — James/Sarah verbatim from spec §8 + 4 more.
  const reviews = [
    {
      slug: "the-pavilion",
      guestName: "James",
      rating: "4.9",
      stayDate: "September 2024",
      body: "Immaculate architecture and perfectly maintained. The integration of the living spaces with the jungle outside is seamless. A truly grounding experience.",
    },
    {
      slug: "the-pavilion",
      guestName: "Sarah",
      rating: "5.0",
      stayDate: "August 2024",
      body: "The level of detail in the design is astounding. The kitchen was a joy to use, and the beds were incredibly comfortable. Highly recommend for a quiet retreat.",
    },
    {
      slug: "courtyard-house",
      guestName: "Mei Lin",
      rating: "4.8",
      stayDate: "July 2024",
      body: "The courtyard pool at dawn is worth the trip alone. Quiet, cool, and impeccably kept.",
    },
    {
      slug: "limestone-retreat",
      guestName: "Daniel",
      rating: "4.7",
      stayDate: "June 2024",
      body: "Waking up to the limestone cliffs through the veranda was unforgettable. The kids loved the pool.",
    },
    {
      slug: "the-horizon-villa",
      guestName: "Aisha",
      rating: "4.9",
      stayDate: "May 2024",
      body: "Ocean from every room. The cantilevered pool at sunset is the single best view in Langkawi.",
    },
    {
      slug: "the-pavilion",
      guestName: "Marcus",
      rating: "4.8",
      stayDate: "April 2024",
      body: "Disciplined, serene, and utterly private. Concierge anticipated everything before we asked.",
    },
  ];
  for (const r of reviews) {
    await db.review.create({
      data: {
        propertyId: pid(r.slug),
        guestName: r.guestName,
        rating: r.rating,
        body: r.body,
        stayDate: r.stayDate,
        approved: true,
      },
    });
  }

  // 9) Internal note on LS-1042 (verbatim from mockup, authored by Sarah L.).
  await db.internalNote.create({
    data: {
      bookingId: bookingIds.get("LS-1042")!,
      body: "Guest requested extra pillows and a late check-out if possible. Housekeeping notified.",
      authorId: admin.id,
    },
  });

  const counts = {
    properties: await db.property.count(),
    users: await db.user.count(),
    guests: await db.guest.count(),
    bookings: await db.booking.count(),
    blocks: await db.availabilityBlock.count(),
    payments: await db.payment.count(),
    reviews: await db.review.count(),
    notes: await db.internalNote.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`Staff user id: ${staff.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
