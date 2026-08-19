import type { Metadata } from "next";

import { VillaCard } from "@/components/guest/VillaCard";
import { Divider } from "@/components/ui/Divider";
import { listProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "The Villas — LumaStay",
  description: "A curated collection of minimalist sanctuaries.",
};

// Villas index (plan 2 task 4, per mockup secondpage): header block
// (headline-md + subcopy), Divider, 2-col grid of VillaCards for every
// active property. Data via listProperties() with seed-fallback.
export default async function VillasPage() {
  const properties = await listProperties();

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
        <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
          The Villas
        </h1>
        <p className="mt-3 max-w-[420px] text-body-md leading-body-md text-on-surface-variant">
          A curated collection of minimalist sanctuaries.
        </p>
        <Divider className="mt-6" />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {properties.map((property) => (
            <VillaCard key={property.slug} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
