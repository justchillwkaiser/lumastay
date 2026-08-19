// Admin derived lists — plan 3 task 11 (lite).
// Simple list functions with offline-safe empty fallbacks; toggles flip a
// single field. Pages stay ~80 lines each reusing the DataTable pattern.

import { db } from "@/lib/db";

export interface AdminPropertyRow {
  id: string;
  name: string;
  shortName: string;
  locationLine: string;
  nightlyRate: string;
  isActive: boolean;
  bookingCount: number;
}

export async function listAdminProperties(): Promise<AdminPropertyRow[]> {
  try {
    const rows = await db.property.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      shortName: r.shortName,
      locationLine: r.locationLine,
      nightlyRate: r.nightlyRate.toString(),
      isActive: r.isActive,
      bookingCount: r._count.bookings,
    }));
  } catch {
    return [];
  }
}

export async function togglePropertyActive(id: string, isActive: boolean) {
  await db.property.update({ where: { id }, data: { isActive } });
}

export interface AdminGuestRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
}

export async function listAdminGuests(): Promise<AdminGuestRow[]> {
  try {
    const rows = await db.guest.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      bookingCount: r._count.bookings,
    }));
  } catch {
    return [];
  }
}

export interface AdminPaymentRow {
  id: string;
  bookingReference: string;
  guestName: string;
  amount: string;
  method: string;
  status: string;
  createdAt: string;
}

export async function listAdminPayments(
  query: { status?: string } = {},
): Promise<AdminPaymentRow[]> {
  try {
    const rows = await db.payment.findMany({
      where: query.status ? { status: query.status as never } : {},
      include: { booking: { include: { guest: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      bookingReference: r.booking.reference,
      guestName: r.booking.guest.name,
      amount: r.amount.toString(),
      method: r.method,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export interface AdminReviewRow {
  id: string;
  guestName: string;
  propertyName: string;
  rating: string;
  body: string;
  approved: boolean;
}

export async function listAdminReviews(): Promise<AdminReviewRow[]> {
  try {
    const rows = await db.review.findMany({
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      guestName: r.guestName,
      propertyName: r.property.shortName,
      rating: r.rating.toString(),
      body: r.body,
      approved: r.approved,
    }));
  } catch {
    return [];
  }
}

export async function toggleReviewApproved(id: string, approved: boolean) {
  await db.review.update({ where: { id }, data: { approved } });
}

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  try {
    const rows = await db.user.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
    }));
  } catch {
    return [];
  }
}
