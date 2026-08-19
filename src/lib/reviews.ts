// Approved-reviews service (plan 2 task 6).
//
// Dev machine has NO local Postgres — any DB error, or no approved rows
// for the slug, resolves to the deterministic seed-fallback so
// `next build` and offline dev stay green (plan 1 constraint). James and
// Sarah review copy is VERBATIM from spec §8.

import { db } from "@/lib/db";

export interface ReviewCardData {
  guestName: string;
  rating: string; // decimal string, e.g. "4.9"
  stayDate: string | null;
  body: string;
}

// Spec §8 verbatim (James / Sarah), matching prisma/seed.ts.
const fallbackReviewsBySlug: Record<string, ReviewCardData[]> = {
  "the-pavilion": [
    {
      guestName: "James",
      rating: "4.9",
      stayDate: "September 2024",
      body: "Immaculate architecture and perfectly maintained. The integration of the living spaces with the jungle outside is seamless. A truly grounding experience.",
    },
    {
      guestName: "Sarah",
      rating: "5.0",
      stayDate: "August 2024",
      body: "The level of detail in the design is astounding. The kitchen was a joy to use, and the beds were incredibly comfortable. Highly recommend for a quiet retreat.",
    },
  ],
  "courtyard-house": [
    {
      guestName: "Mei Lin",
      rating: "4.8",
      stayDate: "July 2024",
      body: "The courtyard pool at dawn is worth the trip alone. Quiet, cool, and impeccably kept.",
    },
  ],
  "limestone-retreat": [
    {
      guestName: "Daniel",
      rating: "4.7",
      stayDate: "June 2024",
      body: "Waking up to the limestone cliffs through the veranda was unforgettable. The kids loved the pool.",
    },
  ],
  "the-horizon-villa": [
    {
      guestName: "Aisha",
      rating: "4.9",
      stayDate: "May 2024",
      body: "Ocean from every room. The cantilevered pool at sunset is the single best view in Langkawi.",
    },
  ],
};

export async function listApprovedReviews(
  propertySlug: string,
): Promise<ReviewCardData[]> {
  try {
    const rows = await db.review.findMany({
      where: { approved: true, property: { slug: propertySlug } },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((row) => ({
        guestName: row.guestName,
        rating: row.rating.toString(),
        stayDate: row.stayDate,
        body: row.body,
      }));
    }
  } catch {
    // fall through to seed-fallback
  }
  return fallbackReviewsBySlug[propertySlug] ?? [];
}
