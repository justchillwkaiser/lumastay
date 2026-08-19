// Server data function for the villas index (plan 2 task 4).
//
// Dev machine has NO local Postgres — any DB error, or an empty property
// table, resolves to the deterministic seed-fallback so `next build` and
// offline dev stay green (plan 1 constraint).

import { db } from "@/lib/db";
import {
  fallbackProperties,
  type PropertyCardData,
} from "@/lib/seed-fallback";

type PropertyRow = NonNullable<
  Awaited<ReturnType<typeof fetchRows>>
>[number];

async function fetchRows() {
  return db.property.findMany({
    where: { isActive: true },
    include: {
      amenities: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });
}

function toCardData(row: PropertyRow): PropertyCardData {
  const fallback =
    fallbackProperties.find((p) => p.slug === row.slug) ??
    fallbackProperties[0];

  const cardImage =
    row.images.find((image) => image.role === "card")?.url ??
    row.images[0]?.url ??
    fallback.cardImage;
  const heroImage =
    row.images.find((image) => image.role === "hero")?.url ??
    row.images[1]?.url ??
    cardImage;

  return {
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    locationLine: row.locationLine,
    nightlyRate: row.nightlyRate.toString(),
    maxGuests: row.maxGuests,
    bedrooms: row.bedrooms,
    beds: row.beds,
    baths: row.baths.toString(),
    areaSqft: row.areaSqft,
    architecture: row.architecture,
    materials: row.materials,
    description: row.description,
    amenities: row.amenities.map((amenity) => ({
      icon: amenity.icon,
      label: amenity.label,
    })),
    specs: row.specs.map((spec) => ({
      label: spec.label,
      value: spec.value,
    })),
    cardImage,
    heroImage,
    rating: fallback.rating,
    reviewCount: fallback.reviewCount,
  };
}

export async function listProperties(): Promise<PropertyCardData[]> {
  try {
    const rows = await fetchRows();
    if (rows.length === 0) return fallbackProperties;
    return rows.map(toCardData);
  } catch {
    return fallbackProperties;
  }
}
