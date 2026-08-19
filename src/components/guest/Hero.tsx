import Link from "next/link";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

import { ParallaxHeroImage } from "@/components/guest/motion";
import { heroCopy } from "@/lib/seed-fallback";

// Frontpage hero (spec §4.1 + plan 2 task 2):
// - min-h-[100dvh], next/image fill + priority (CLS guard)
// - parallax: image layer drifts 60px slower than scroll (client leaf,
//   reduced-motion falls back to the static fill image)
// - white scrim rising from the bottom so the bottom-left content stays AA
// - 3-line display-lg headline; line 3 faded via opacity-50 (NOT a gradient mask)
// - content pinned bottom-left, 5% gutter, ~10vh bottom clearance
// - CTA is a text-link (14px/600, underline offset 4) with ArrowDown icon
export function Hero() {
  const [line1, line2, line3] = heroCopy.headlineLines;

  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
      <ParallaxHeroImage src={heroCopy.image} alt={heroCopy.imageAlt} />
      {/* White scrim: strong at the fold, transparent by 45% height. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,.85), rgba(255,255,255,.4) 20%, transparent 45%)",
        }}
      />
      <div className="relative left-0 mb-[10vh] ml-[5%] mr-[5%]">
        <h1 className="text-display-lg-mobile leading-display-lg-mobile tracking-display-lg-mobile font-bold text-on-surface lg:text-display-lg lg:leading-display-lg lg:tracking-display-lg">
          <span className="block">{line1}</span>
          <span className="block">{line2}</span>
          <span className="block opacity-50">{line3}</span>
        </h1>
        <p className="mt-8 max-w-[420px] text-body-md leading-body-md text-on-surface-variant">
          {heroCopy.subcopy}
        </p>
        <Link
          href={heroCopy.ctaHref}
          className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-on-surface underline underline-offset-4 transition-colors hover:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {heroCopy.ctaLabel}
          <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
