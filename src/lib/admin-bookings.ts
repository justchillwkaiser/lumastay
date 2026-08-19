// Admin bookings list — plan 3 task 8.
// Filters: status, propertyId, from, to, search (OR across reference /
// guest.name / property.name), pagination page + pageSize (default 10).
// DB offline → fallback rows (BK-1042..BK-1045, total 128 per mockup).

import { db } from "@/lib/db";
import { formatMyrCompact } from "@/lib/format";

export interface BookingRow {
  id: string;
  reference: string;
  guestName: string;
  propertyName: string;
  stayDates: string;
  amount: string;
  status: string;
}

export interface ListBookingsQuery {
  status?: string;
  propertyId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const FALLBACK_ROWS: BookingRow[] = [
  { id: "fb-1042", reference: "BK-1042", guestName: "Alexander Wright", propertyName: "The Pavilion", stayDates: "Oct 12 - Oct 15", amount: "RM 13,860", status: "CONFIRMED" },
  { id: "fb-1043", reference: "BK-1043", guestName: "Ahmad Aiman", propertyName: "The Ridge", stayDates: "Oct 14 - Oct 16", amount: "RM 2,090", status: "PENDING" },
  { id: "fb-1044", reference: "BK-1044", guestName: "Sarah Lim", propertyName: "The Courtyard", stayDates: "Oct 18 - Oct 21", amount: "RM 4,845", status: "CONFIRMED" },
  { id: "fb-1045", reference: "BK-1045", guestName: "Daniel Tan", propertyName: "The Canopy", stayDates: "Oct 20 - Oct 22", amount: "RM 5,200", status: "CANCELLED" },
];

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function listBookings(
  query: ListBookingsQuery = {},
): Promise<{ rows: BookingRow[]; total: number }> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 10;

  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.propertyId) where.propertyId = query.propertyId;
  if (query.from || query.to) {
    where.checkIn = {
      ...(query.from ? { gte: new Date(`${query.from}T00:00:00Z`) } : {}),
      ...(query.to ? { lte: new Date(`${query.to}T00:00:00Z`) } : {}),
    };
  }
  if (query.search) {
    const q = query.search;
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { guest: { name: { contains: q, mode: "insensitive" } } },
      { property: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  try {
    const [rows, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: { guest: true, property: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.booking.count({ where }),
    ]);

    return {
      total,
      rows: rows.map((row) => ({
        id: row.id,
        reference: row.reference,
        guestName: row.guest.name,
        propertyName: row.property.shortName,
        stayDates: `${shortDate(row.checkIn)} - ${shortDate(row.checkOut)}`,
        amount: formatMyrCompact(row.totalAmount.toString()),
        status: row.status,
      })),
    };
  } catch {
    return {
      total: 128, // mockup total
      rows: FALLBACK_ROWS.slice((page - 1) * pageSize, page * pageSize),
    };
  }
}
