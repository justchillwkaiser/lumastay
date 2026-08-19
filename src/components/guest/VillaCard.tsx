import Image from "next/image";
import Link from "next/link";
import {
  Anchor,
  Bed,
  CookingPot,
  Mountains,
  Waves,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import type { PropertyCardData } from "@/lib/seed-fallback";

export interface VillaCardProps {
  property: PropertyCardData;
}

// Frontpage/villas-index villa card (plan 2 task 3, per mockup Main.png):
// flat on the surface-container section bg — no outer container card.
// 4:3 sharp-cornered image; row below: name + mono-data price ("RM 950+");
// white bordered Card p-5 with location (short, no country), Divider, meta
// row (beds + first-amenity feature). Whole card is a link to the detail page.

const FEATURE_ICONS: Record<string, PhosphorIcon> = {
  waves: Waves,
  mountains: Mountains,
  anchor: Anchor,
  "cooking-pot": CookingPot,
};

function formatCardPrice(nightlyRate: string): string {
  return `RM ${Number(nightlyRate).toLocaleString("en-MY", {
    maximumFractionDigits: 0,
  })}+`;
}

export function VillaCard({ property }: VillaCardProps) {
  const location = property.locationLine.replace(/, Malaysia$/, "");
  const feature = property.amenities[0];
  const FeatureIcon = feature ? (FEATURE_ICONS[feature.icon] ?? Waves) : null;

  return (
    <Link
      href={`/villas/${property.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={property.cardImage}
          alt={`${property.name} — ${property.locationLine}`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-body-md font-semibold leading-body-md text-on-surface">
          {property.name}
        </h3>
        <span className="text-mono-data leading-mono-data text-on-surface-variant">
          {formatCardPrice(property.nightlyRate)}
        </span>
      </div>

      <Card className="mt-3 p-5">
        <p className="text-sm font-medium text-on-surface">{location}</p>
        <Divider className="my-4" />
        <div className="flex items-center gap-6 text-xs text-on-surface-variant">
          <span className="inline-flex items-center gap-2">
            <Bed size={16} strokeWidth={1.5} aria-hidden="true" />
            {property.beds} Beds
          </span>
          {feature && FeatureIcon ? (
            <span className="inline-flex items-center gap-2">
              <FeatureIcon size={16} strokeWidth={1.5} aria-hidden="true" />
              {feature.label}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
