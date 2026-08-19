import type { Metadata } from "next";

import { Reveal } from "@/components/guest/motion";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

export const metadata: Metadata = {
  title: "Our Heritage",
  description:
    "Rooted in the Malaysian landscape, built for permanence. The story and philosophy behind LumaStay.",
};

// /heritage — full page. Editorial, type-driven, generous whitespace.
export default function HeritagePage() {
  return (
    <>
      {/* Page header */}
      <section className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-20 lg:px-10 lg:pt-28">
        <Reveal>
          <LabelCaps>01 / OUR HERITAGE</LabelCaps>
          <h1 className="mt-4 max-w-[720px] text-display-lg-mobile font-bold leading-[1.1] tracking-[-0.03em] text-on-surface lg:text-display-lg lg:leading-display-lg lg:tracking-display-lg">
            Rooted in the Malaysian landscape, built for permanence.
          </h1>
        </Reveal>
      </section>

      {/* Story */}
      <section className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
        <Reveal>
          <Divider />
          <div className="grid gap-10 py-16 lg:grid-cols-2">
            <div>
              <LabelCaps as="span">The Beginning</LabelCaps>
              <p className="mt-4 text-body-lg leading-body-lg text-on-surface">
                LumaStay began with a single conviction: that architecture
                should frame nature, not compete with it.
              </p>
            </div>
            <div className="space-y-5 text-body-md leading-body-md text-on-surface-variant">
              <p>
                Founded by a collective of architects and conservationists,
                our collection grew from a shared frustration with resorts
                that imposed themselves on the land — clearing, leveling,
                dominating.
              </p>
              <p>
                We chose a different path. Each villa is sited with
                discipline: oriented to capture the morning light, channel the
                valley breeze, and hold the view without disturbing the slope
                it stands on.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <Divider />
          <div className="grid gap-10 py-16 lg:grid-cols-2">
            <div>
              <LabelCaps as="span">Materials</LabelCaps>
              <p className="mt-4 text-body-lg leading-body-lg text-on-surface">
                Off-form concrete, local merbau, passive cooling.
              </p>
            </div>
            <div className="space-y-5 text-body-md leading-body-md text-on-surface-variant">
              <p>
                Our material palette is drawn from the region itself —
                off-form concrete cast on site, merbau timber from certified
                sustainable concessions, and stone quarried within the state.
              </p>
              <p>
                We borrow from traditional Malay and colonial shophouse
                typologies — deep verandas, cross-ventilation, elevated
                floors — and reinterpret them through a modernist lens.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <Divider />
          <div className="grid gap-10 py-16 lg:grid-cols-2">
            <div>
              <LabelCaps as="span">Philosophy</LabelCaps>
              <p className="mt-4 text-body-lg leading-body-lg text-on-surface">
                Restraint as a form of luxury.
              </p>
            </div>
            <div className="space-y-5 text-body-md leading-body-md text-on-surface-variant">
              <p>
                We believe true luxury is not abundance but precision — the
                exact placement of a window, the weight of a door handle, the
                silence of a well-detailed junction.
              </p>
              <p>
                Every LumaStay property is designed to disappear into its
                surroundings over time, weathering gracefully rather than
                resisting the climate.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
