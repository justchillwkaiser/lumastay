import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

// Frontpage section 03 / HERITAGE (frontpage polish): editorial two-column
// — large serif-style statement left, body copy right. Swiss grid, generous
// whitespace, no images (type-driven).
export function OurHeritage() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
          Our Heritage
        </h2>
        <LabelCaps>03 / HERITAGE</LabelCaps>
      </div>
      <Divider className="mt-6" />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <p className="text-[28px] font-medium leading-[1.3] tracking-[-0.01em] text-on-surface">
          Rooted in the Malaysian landscape, built for permanence.
        </p>
        <div className="space-y-5 text-body-md leading-body-md text-on-surface-variant">
          <p>
            LumaStay began with a single conviction: that architecture should
            frame nature, not compete with it. Each villa in our collection is
            sited with discipline — oriented to capture light, ventilation, and
            the quiet drama of the tropics.
          </p>
          <p>
            We work with off-form concrete, local merbau timber, and passive
            cooling principles drawn from traditional Malay and colonial
            shophouse typologies, reimagined through a modernist lens.
          </p>
        </div>
      </div>
    </section>
  );
}
