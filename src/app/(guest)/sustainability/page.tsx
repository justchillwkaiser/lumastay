import type { Metadata } from "next";

import { Reveal } from "@/components/guest/motion";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "Passive cooling, harvested rainwater, and materials sourced within 100 kilometres. How LumaStay builds lightly on the land.",
};

const METRICS = [
  { value: "100%", label: "Rainwater Harvested" },
  { value: "-40%", label: "Energy vs. Conventional" },
  { value: "87%", label: "Local Materials" },
];

const PRINCIPLES = [
  {
    title: "Passive First",
    body: "Orientation, shading, and cross-ventilation before any mechanical system. Our villas are designed to breathe with the valley, not against it.",
  },
  {
    title: "Closed Water Loop",
    body: "Every drop of rain is captured, filtered, and reused. Greywater irrigates the landscape; blackwater is treated on site.",
  },
  {
    title: "Local Material Economy",
    body: "Concrete aggregate, merbau timber, and stone are sourced within 100 kilometres — reducing embodied carbon and supporting regional craft.",
  },
];

// /sustainability — dark editorial page.
export default function SustainabilityPage() {
  return (
    <>
      <section className="w-full bg-primary-container">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <LabelCaps className="text-on-primary-container">
              03 / SUSTAINABILITY
            </LabelCaps>
            <h1 className="mt-4 max-w-[720px] text-display-lg-mobile font-bold leading-[1.1] tracking-[-0.03em] text-on-primary lg:text-display-lg lg:leading-display-lg lg:tracking-display-lg">
              Lightly on the land.
            </h1>
            <p className="mt-6 max-w-[560px] text-body-lg leading-body-lg text-on-primary-container">
              Every LumaStay villa is designed to exist with minimal footprint
              — environmentally, visually, and culturally.
            </p>
          </Reveal>

          <Reveal>
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <p className="text-mono-data text-[40px] font-bold leading-none text-on-primary">
                    {m.value}
                  </p>
                  <LabelCaps className="mt-3 block text-on-primary-container">
                    {m.label}
                  </LabelCaps>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.title}>
            {i > 0 && <Divider />}
            <div className="grid gap-6 py-12 lg:grid-cols-2">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                {p.title}
              </h2>
              <p className="text-body-md leading-body-md text-on-surface-variant">
                {p.body}
              </p>
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
