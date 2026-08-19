import Link from "next/link";

import { VillaCard } from "@/components/guest/VillaCard";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";
import type { PropertyCardData } from "@/lib/seed-fallback";

export interface TheCollectionProps {
  properties: PropertyCardData[];
}

// Frontpage section 02 / DISCOVER (plan 2 task 3, per mockup Main.png):
// surface-container tonal band; header row (headline-md left, LabelCaps
// eyebrow right) + Divider; 3-col grid of VillaCards; centered ghost CTA to
// /villas. Mobile collapses to 1 column with 20px margins.
export function TheCollection({ properties }: TheCollectionProps) {
  return (
    <section className="w-full bg-surface-container">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
            The Collection
          </h2>
          <LabelCaps>02 / DISCOVER</LabelCaps>
        </div>
        <Divider className="mt-6" />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {properties.map((property) => (
            <VillaCard key={property.slug} property={property} />
          ))}
        </div>

        <div className="mt-11 flex justify-center">
          <Link
            href="/villas"
            className="inline-flex items-center justify-center gap-2 rounded border border-outline-variant bg-transparent px-6 py-3 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface transition-colors hover:bg-surface-container-low active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View Full Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
