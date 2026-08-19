import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "@phosphor-icons/react/dist/ssr";

import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import type { PropertyCardData } from "@/lib/seed-fallback";

export interface FeaturedSanctuaryProps {
  property: PropertyCardData;
}

function formatNightlyRate(nightlyRate: string): string {
  return `RM ${Number(nightlyRate).toLocaleString("en-MY", {
    maximumFractionDigits: 0,
  })}`;
}

// Frontpage section 01 / SPOTLIGHT (plan 2 task 2, per mockup Main.png):
// max-w-[1280px] container; header row (headline-md left, LabelCaps eyebrow
// right) + Divider; 62/38 grid. Left: 4:3 image with white "RESORT" tag.
// Right: Card p-8 with name + rating pill, location row, card description,
// Divider, price row, ghost CTA to the villa detail page.
//
// Card description is the short feature copy (mockup), NOT the long verbatim
// Pavilion description — that lives on the property detail page (spec §8).
const CARD_DESCRIPTION =
  "An architectural marvel suspended above the Hulu Langat rainforest canopy, framing stillness through concrete, timber, and glass.";

export function FeaturedSanctuary({ property }: FeaturedSanctuaryProps) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
          Featured Sanctuary
        </h2>
        <LabelCaps>01 / SPOTLIGHT</LabelCaps>
      </div>
      <Divider className="mt-6" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[62fr_38fr]">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={property.cardImage}
            alt={`${property.name} — ${property.locationLine}`}
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover"
          />
          <LabelCaps className="absolute left-[10px] top-[10px] bg-surface-container-lowest px-3 py-2 text-on-surface">
            RESORT
          </LabelCaps>
        </div>

        <Card className="p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-headline-sm font-semibold leading-headline-sm tracking-headline-sm text-on-surface">
              {property.name}
            </h3>
            <span className="inline-flex items-center gap-1 rounded border border-outline-variant px-2 py-1 text-xs font-semibold text-on-surface">
              <Star size={12} weight="fill" aria-hidden="true" />
              {property.rating.toFixed(1)}
            </span>
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
            <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
            {property.locationLine}
          </p>

          <p className="mt-5 text-body-md leading-body-md text-on-surface-variant">
            {CARD_DESCRIPTION}
          </p>

          <Divider className="my-6" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-on-surface-variant">
              Starting from
            </span>
            <span className="text-mono-data text-on-surface">
              <strong className="text-base font-bold">
                {formatNightlyRate(property.nightlyRate)}
              </strong>{" "}
              / night
            </span>
          </div>

          <Link
            href={`/villas/${property.slug}`}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded border border-outline-variant bg-transparent px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-low active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Explore Villa
          </Link>
        </Card>
      </div>
    </section>
  );
}
