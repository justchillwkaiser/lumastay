import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Star } from "@phosphor-icons/react/dist/ssr";

import { BookingCard } from "@/components/guest/BookingCard";
import { PropertyGallery } from "@/components/guest/PropertyGallery";
import { Divider } from "@/components/ui/Divider";
import { getPropertyBySlug } from "@/lib/properties";
import type { PropertyCardData } from "@/lib/seed-fallback";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Villa not found — LumaStay" };
  return {
    title: `${property.name} — LumaStay`,
    description: property.description,
  };
}

function hostMetaLine(property: PropertyCardData): string {
  return `${property.maxGuests} guests • ${property.bedrooms} bedrooms • ${property.beds} beds • ${property.baths} baths`;
}

// Property detail — top half (plan 2 task 5, per mockup secondpage):
// H1 + rating/location meta, 5-image gallery, hosted-by + description,
// sticky presentational BookingCard in the right column. Bottom half
// (amenities, specs, map, reviews) lands in plan 2 task 6.
export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10 lg:py-14">
        <h1 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
          {property.name}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          <Star
            size={16}
            weight="fill"
            strokeWidth={1.5}
            className="text-on-surface"
            aria-hidden="true"
          />
          <span>
            <strong className="font-semibold text-on-surface">
              {property.rating.toFixed(2)}
            </strong>{" "}
            ({property.reviewCount} reviews)
          </span>
          <span aria-hidden="true">•</span>
          <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>{property.locationLine}</span>
        </p>

        <div className="mt-8">
          <PropertyGallery property={property} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-headline-sm font-semibold leading-headline-sm tracking-headline-sm text-on-surface">
                  Entire villa hosted by LumaStay
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {hostMetaLine(property)}
                </p>
              </div>
              <Image
                src={`https://picsum.photos/seed/lumastay-host/96/96`}
                alt="LumaStay host avatar"
                width={48}
                height={48}
                className="shrink-0 rounded-full"
              />
            </div>
            <Divider className="my-6" />
            <p className="max-w-[640px] text-body-lg font-normal leading-body-lg text-on-surface">
              {property.description}
            </p>
            <Divider className="my-6" />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingCard property={property} />
          </aside>
        </div>
      </div>
    </section>
  );
}
