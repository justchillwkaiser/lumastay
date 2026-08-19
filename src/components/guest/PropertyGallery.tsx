import Image from "next/image";

import type { PropertyCardData } from "@/lib/seed-fallback";

export interface PropertyGalleryProps {
  property: PropertyCardData;
}

// 5-image gallery (plan 2 task 5, per mockup secondpage p1):
// - desktop (lg): grid-cols-2 — left hero image full height, right
//   grid-cols-2 grid-rows-2 with 4 tiles; all radius 8px, gap 2,
//   reserved aspect (hero 4:3, tiles 4:3)
// - mobile: horizontal scroll-snap row, each slide 85% wide
// Images are picsum placeholders pending real villa photography (spec §8
// known deferral) — derived deterministically from the property slug.
function galleryImages(property: PropertyCardData): string[] {
  return [
    property.heroImage,
    property.cardImage,
    ...[3, 4, 5].map(
      (n) => `https://picsum.photos/seed/lumastay-${property.slug}-${n}/1600/1200`,
    ),
  ];
}

function GalleryImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
    />
  );
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const images = galleryImages(property);
  const alt = (n: number) => `${property.name} — photo ${n}`;

  return (
    <>
      {/* Desktop: hero-left + 2x2 tile grid. */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <GalleryImage
            src={images[0]}
            alt={alt(1)}
            sizes="(min-width: 1024px) 50vw"
            priority
          />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {images.slice(1).map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <GalleryImage
                src={src}
                alt={alt(i + 2)}
                sizes="(min-width: 1024px) 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: horizontal scroll-snap row. */}
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto lg:hidden">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-lg"
          >
            <GalleryImage
              src={src}
              alt={alt(i + 1)}
              sizes="85vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </>
  );
}
