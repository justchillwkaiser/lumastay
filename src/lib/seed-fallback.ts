// Static seed-fallback module for LumaStay guest pages.
//
// Purpose: dev machine has NO local Postgres — server data functions catch DB
// errors and fall back to this module so `next build` and offline dev stay
// green. Data is VERBATIM from spec §8 (mockup copy, brand-swapped).
//
// Images are picsum.photos placeholders, documented as pending real villa
// photography (spec §8 / plan 1 known deferrals).

// Frontpage hero copy, VERBATIM from spec §8 (brand-swapped to LumaStay).
// Kept here (not hardcoded in the component) so copy changes stay with data.
export const heroCopy = {
  headlineLines: ["Architectural", "Permanence.", "Natural Serenity."],
  subcopy:
    "A curated collection of minimalist sanctuaries designed to elevate your connection to the Malaysian landscape.",
  ctaLabel: "Discover Our Villas",
  ctaHref: "/villas",
  image: "https://picsum.photos/seed/lumastay-hero/1600/900",
  imageAlt:
    "Minimalist tropical villa pavilion suspended above the Hulu Langat rainforest canopy.",
} as const;

export interface PropertyAmenity {
  icon: string; // phosphor icon key
  label: string;
}

export interface PropertySpecItem {
  label: string;
  value: string;
}

export interface PropertyCardData {
  slug: string;
  name: string;
  shortName: string;
  locationLine: string;
  nightlyRate: string; // decimal string, e.g. "3200.00"
  cleaningFee: string; // decimal string, e.g. "400.00" (plan 3 pricing)
  serviceFeePct: string; // decimal string, e.g. "5.0"
  taxPct: string; // decimal string, e.g. "0"
  checkInTime: string; // e.g. "3:00 PM"
  checkOutTime: string; // e.g. "12:00 PM"
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: string; // decimal string, e.g. "4.5"
  areaSqft: number;
  architecture: string;
  materials: string;
  description: string;
  amenities: PropertyAmenity[];
  specs: PropertySpecItem[];
  cardImage: string;
  heroImage: string;
  rating: number;
  reviewCount: number;
}

function picsum(slug: string, n: number): string {
  return `https://picsum.photos/seed/lumastay-${slug}-${n}/1600/1200`;
}

export const fallbackProperties: PropertyCardData[] = [
  {
    slug: "the-pavilion",
    name: "The Pavilion at Hulu Langat",
    shortName: "The Pavilion",
    locationLine: "Hulu Langat, Selangor, Malaysia",
    nightlyRate: "3200.00",
    cleaningFee: "400.00",
    serviceFeePct: "5.0",
    taxPct: "0",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    baths: "4.5",
    areaSqft: 4500,
    architecture: "Modernist Tropical",
    materials: "Off-form Concrete, Merbau Timber",
    description:
      "Experience unparalleled architectural permanence amidst the ancient rainforests of Hulu Langat. The Pavilion is a masterclass in minimalist design, offering an objective presentation of luxury where structural integrity meets natural serenity. Designed with a disciplined layout, every space directs focus toward the lush surroundings and the essential comforts of a high-end retreat.",
    amenities: [
      { icon: "waves", label: "Infinity Pool" },
      { icon: "wifi-high", label: "High-speed Wi-Fi" },
      { icon: "cooking-pot", label: "Chef's Kitchen" },
      { icon: "car", label: "Private Parking" },
      { icon: "snowflake", label: "Central Air Conditioning" },
      { icon: "monitor-play", label: "Media Room" },
    ],
    specs: [
      { label: "TOTAL AREA", value: "4,500 sq ft" },
      { label: "ARCHITECTURE", value: "Modernist Tropical" },
      { label: "MATERIALS", value: "Off-form Concrete, Merbau Timber" },
    ],
    cardImage: picsum("the-pavilion", 1),
    heroImage: picsum("the-pavilion", 2),
    rating: 4.95,
    reviewCount: 128,
  },
  {
    slug: "courtyard-house",
    name: "Courtyard House",
    shortName: "Courtyard House",
    locationLine: "Janda Baik, Pahang, Malaysia",
    nightlyRate: "950.00",
    cleaningFee: "400.00",
    serviceFeePct: "5.0",
    taxPct: "0",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: "2.0",
    areaSqft: 1800,
    architecture: "Courtyard Modern",
    materials: "Brick, Chengal Timber",
    description:
      "A quiet courtyard retreat in the misty highlands of Janda Baik. Two bedrooms open onto a private pool and a shaded inner court — a compact sanctuary engineered for slow mornings and cool evening air.",
    amenities: [
      { icon: "waves", label: "Private Pool" },
      { icon: "wifi-high", label: "High-speed Wi-Fi" },
      { icon: "cooking-pot", label: "Organic Kitchen" },
      { icon: "car", label: "Private Parking" },
    ],
    specs: [
      { label: "TOTAL AREA", value: "1,800 sq ft" },
      { label: "ARCHITECTURE", value: "Courtyard Modern" },
      { label: "MATERIALS", value: "Brick, Chengal Timber" },
    ],
    cardImage: picsum("courtyard-house", 1),
    heroImage: picsum("courtyard-house", 2),
    rating: 4.8,
    reviewCount: 64,
  },
  {
    slug: "limestone-retreat",
    name: "Limestone Retreat",
    shortName: "Limestone Retreat",
    locationLine: "Tambun, Perak, Malaysia",
    nightlyRate: "1400.00",
    cleaningFee: "400.00",
    serviceFeePct: "5.0",
    taxPct: "0",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    maxGuests: 6,
    bedrooms: 4,
    beds: 4,
    baths: "3.0",
    areaSqft: 2600,
    architecture: "Tropical Modernist",
    materials: "Limestone, Balau Timber",
    description:
      "Set against the ancient limestone karsts of Tambun, this four-bed retreat frames the forest through deep verandas and stone walls. A grounding escape built for families and quiet gatherings.",
    amenities: [
      { icon: "mountains", label: "Forest View" },
      { icon: "waves", label: "Private Pool" },
      { icon: "wifi-high", label: "High-speed Wi-Fi" },
      { icon: "car", label: "Private Parking" },
    ],
    specs: [
      { label: "TOTAL AREA", value: "2,600 sq ft" },
      { label: "ARCHITECTURE", value: "Tropical Modernist" },
      { label: "MATERIALS", value: "Limestone, Balau Timber" },
    ],
    cardImage: picsum("limestone-retreat", 1),
    heroImage: picsum("limestone-retreat", 2),
    rating: 4.7,
    reviewCount: 41,
  },
  {
    slug: "the-horizon-villa",
    name: "The Horizon Villa",
    shortName: "The Horizon Villa",
    locationLine: "Datai Bay, Langkawi, Malaysia",
    nightlyRate: "2100.00",
    cleaningFee: "400.00",
    serviceFeePct: "5.0",
    taxPct: "0",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: "3.5",
    areaSqft: 3200,
    architecture: "Coastal Modernist",
    materials: "Off-form Concrete, Teak",
    description:
      "Perched above Datai Bay, The Horizon Villa opens every room to the Andaman Sea. Ocean-front terraces, a cantilevered pool, and disciplined interiors make the horizon the only ornament.",
    amenities: [
      { icon: "anchor", label: "Ocean Front" },
      { icon: "waves", label: "Infinity Pool" },
      { icon: "wifi-high", label: "High-speed Wi-Fi" },
      { icon: "car", label: "Private Parking" },
    ],
    specs: [
      { label: "TOTAL AREA", value: "3,200 sq ft" },
      { label: "ARCHITECTURE", value: "Coastal Modernist" },
      { label: "MATERIALS", value: "Off-form Concrete, Teak" },
    ],
    cardImage: picsum("the-horizon-villa", 1),
    heroImage: picsum("the-horizon-villa", 2),
    rating: 4.9,
    reviewCount: 87,
  },
];

export function getPropertyBySlugFallback(
  slug: string,
): PropertyCardData | undefined {
  return fallbackProperties.find((p) => p.slug === slug);
}
