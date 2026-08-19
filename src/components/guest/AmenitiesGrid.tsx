import {
  Anchor,
  Car,
  CookingPot,
  MonitorPlay,
  Mountains,
  Snowflake,
  Waves,
  WifiHigh,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";

import type { PropertyAmenity } from "@/lib/seed-fallback";

export interface AmenitiesGridProps {
  amenities: PropertyAmenity[];
}

type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

// Maps the Amenity.icon phosphor key (seed data) to the imported icon.
const iconByKey: Record<string, IconComponent> = {
  anchor: Anchor,
  car: Car,
  "cooking-pot": CookingPot,
  "monitor-play": MonitorPlay,
  mountains: Mountains,
  snowflake: Snowflake,
  waves: Waves,
  "wifi-high": WifiHigh,
};

// Amenities section (plan 2 task 6, per mockup secondpage): headline-sm,
// 2-col grid (1 col on mobile) of 24px phosphor icon + body-md label rows.
export function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  return (
    <section aria-labelledby="amenities-heading">
      <h2
        id="amenities-heading"
        className="text-headline-sm font-semibold leading-headline-sm tracking-headline-sm text-on-surface"
      >
        What this place offers
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        {amenities.map((amenity) => {
          const Icon = iconByKey[amenity.icon] ?? CheckCircle;
          return (
            <li key={amenity.label} className="flex items-center gap-4">
              <Icon
                size={24}
                strokeWidth={1.5}
                className="shrink-0 text-on-surface"
                aria-hidden="true"
              />
              <span className="text-body-md font-normal leading-body-md text-on-surface">
                {amenity.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
