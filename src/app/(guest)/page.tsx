import type { Metadata } from "next";

import { CuratedExperiences } from "@/components/guest/CuratedExperiences";
import { FeaturedSanctuary } from "@/components/guest/FeaturedSanctuary";
import { Hero } from "@/components/guest/Hero";
import { PressQuote } from "@/components/guest/PressQuote";
import { Reveal } from "@/components/guest/motion";
import { TheCollection } from "@/components/guest/TheCollection";
import { db } from "@/lib/db";
import {
  fallbackProperties,
  type PropertyCardData,
} from "@/lib/seed-fallback";

export const metadata: Metadata = {
  title: "LumaStay — Architectural Permanence. Natural Serenity.",
  description:
    "A curated collection of minimalist sanctuaries designed to elevate your connection to the Malaysian landscape.",
};

// Server fetch with seed-fallback (offline build-safe, plan 1 constraint):
// the dev machine has no local Postgres, so any DB error — or an empty
// table — resolves to the fallback Pavilion.
async function getFeaturedProperty(): Promise<PropertyCardData> {
  const fallback = fallbackProperties[0];
  try {
    const row = await db.property.findFirst({
      where: { slug: "the-pavilion", isActive: true },
      include: {
        amenities: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        specs: true,
      },
    });
    if (!row) return fallback;

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
      cleaningFee: row.cleaningFee.toString(),
      serviceFeePct: row.serviceFeePct.toString(),
      taxPct: row.taxPct.toString(),
      checkInTime: row.checkInTime,
      checkOutTime: row.checkOutTime,
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
  } catch {
    return fallback;
  }
}

export default async function Home() {
  const featured = await getFeaturedProperty();

  return (
    <>
      <Hero />
      <Reveal>
        <FeaturedSanctuary property={featured} />
      </Reveal>
      <Reveal>
        <TheCollection properties={fallbackProperties.slice(1)} />
      </Reveal>
      <Reveal>
        <CuratedExperiences />
      </Reveal>
      <Reveal>
        <PressQuote />
      </Reveal>
    </>
  );
}
