import type { Metadata } from "next";

import { Reveal } from "@/components/guest/motion";
import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Rainforest immersion, culinary residencies, and wellness circuits — curated experiences at LumaStay.",
};

const EXPERIENCES = [
  {
    no: "01",
    title: "Rainforest Immersion",
    description:
      "Guided canopy walks and waterfall excursions led by resident naturalists, departing each morning from your villa. Learn to read the forest — its layers, its rhythms, its inhabitants.",
    detail: "Daily · 2–4 hours · All levels",
  },
  {
    no: "02",
    title: "Culinary Residency",
    description:
      "Farm-to-table tasting menus prepared in-villa by our resident chefs, featuring produce from the Hulu Langat valley. A rotating residency programme brings guest chefs from across Southeast Asia.",
    detail: "On request · 5–7 courses · Dietary accommodated",
  },
  {
    no: "03",
    title: "Wellness Circuit",
    description:
      "Private yoga at dawn, in-villa spa therapies, and meditation decks oriented toward the morning light. Our wellness practitioners design each circuit around your stay.",
    detail: "Daily · 60–90 minutes · Private sessions",
  },
];

// /experiences — full page, numbered editorial rows.
export default function ExperiencesPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-20 lg:px-10 lg:pt-28">
        <Reveal>
          <LabelCaps>02 / EXPERIENCES</LabelCaps>
          <h1 className="mt-4 max-w-[720px] text-display-lg-mobile font-bold leading-[1.1] tracking-[-0.03em] text-on-surface lg:text-display-lg lg:leading-display-lg lg:tracking-display-lg">
            Curated for stillness.
          </h1>
          <p className="mt-6 max-w-[480px] text-body-lg leading-body-lg text-on-surface-variant">
            Every experience is designed to deepen your connection to the
            landscape — never to distract from it.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 pb-20 lg:px-10">
        {EXPERIENCES.map((item, i) => (
          <Reveal key={item.no}>
            {i > 0 && <Divider />}
            <div className="grid gap-6 py-12 lg:grid-cols-[120px_1fr_1fr]">
              <span className="text-mono-data text-on-surface-variant">
                {item.no}
              </span>
              <div>
                <h2 className="text-headline-sm font-semibold text-on-surface">
                  {item.title}
                </h2>
                <p className="mt-2 text-label-caps text-on-surface-variant">
                  {item.detail}
                </p>
              </div>
              <p className="text-body-md leading-body-md text-on-surface-variant">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
