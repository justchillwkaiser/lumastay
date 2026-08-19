// Admin overview metrics — plan 3 task 7.
// DB-first; ANY error resolves to the mockup fallback object so the admin
// dashboard still paints during offline dev (same contract as guest pages).

import { db } from "@/lib/db";

export interface OverviewMetrics {
  revenueYtd: string;
  revenueDeltaPct: number;
  occupancyPct: number;
  totalBookings: number;
  pendingCount: number;
  nextArrival: {
    guestName: string;
    property: string;
    guests: number;
    time: string;
  } | null;
  activity30d: { date: string; count: number }[];
  recent: { icon: string; title: string; sub: string; ago: string }[];
}

// Mockup fallback values (plan 3 task 7 step 1).
const FALLBACK: OverviewMetrics = {
  revenueYtd: "45200.00",
  revenueDeltaPct: 12,
  occupancyPct: 88,
  totalBookings: 1204,
  pendingCount: 8,
  nextArrival: {
    guestName: "Ahmad Aiman",
    property: "The Pavilion",
    guests: 2,
    time: "3:00 PM",
  },
  activity30d: Array.from({ length: 30 }, (_, i) => ({
    date: `${String(i + 1).padStart(2, "0")} Oct`,
    count: [3, 5, 2, 7, 4, 6, 8, 3, 5, 9, 4, 6, 2, 7, 5, 8, 3, 6, 4, 9, 5, 2, 7, 6, 4, 8, 3, 5, 7, 6][i],
  })),
  recent: [
    {
      icon: "calendar-plus",
      title: "New booking — The Pavilion",
      sub: "Alexander Wright · 4 nights",
      ago: "12m ago",
    },
    {
      icon: "credit-card",
      title: "Payment recorded",
      sub: "LS-1041 · RM 13,860.00",
      ago: "1h ago",
    },
    {
      icon: "user-plus",
      title: "Guest account claimed",
      sub: "a.wright@example.com",
      ago: "3h ago",
    },
  ],
};

function startOfYear(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  try {
    const [revenue, totalBookings, pendingCount, activeProperties, arrivals] =
      await Promise.all([
        db.payment.aggregate({
          _sum: { amount: true },
          where: { status: "PAID", paidAt: { gte: startOfYear() } },
        }),
        db.booking.count(),
        db.booking.count({ where: { status: "PENDING" } }),
        db.property.count({ where: { isActive: true } }),
        db.booking.findMany({
          where: {
            status: "CONFIRMED",
            checkIn: { gte: new Date(new Date().toDateString()) },
          },
          include: { guest: true, property: true },
          orderBy: { checkIn: "asc" },
          take: 1,
        }),
      ]);

    const next = arrivals[0];
    const revenueNum = Number(revenue._sum.amount ?? 0);
    return {
      revenueYtd: revenueNum.toFixed(2),
      revenueDeltaPct: FALLBACK.revenueDeltaPct,
      occupancyPct: FALLBACK.occupancyPct,
      totalBookings,
      pendingCount,
      nextArrival: next
        ? {
            guestName: next.guest.name,
            property: next.property.shortName,
            guests: next.adults + next.children,
            time: next.property.checkInTime,
          }
        : null,
      activity30d: FALLBACK.activity30d,
      recent: FALLBACK.recent,
    };
  } catch {
    return FALLBACK;
  }
}
