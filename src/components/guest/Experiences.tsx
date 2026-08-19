import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

// Frontpage section 04 / EXPERIENCES (frontpage polish): 3 numbered rows —
// Rainforest Immersion, Culinary Residency, Wellness Circuit. Hairline
// dividers, number in mono-data, hover state subtle.
const EXPERIENCES = [
  {
    no: "01",
    title: "Rainforest Immersion",
    description:
      "Guided canopy walks and waterfall excursions led by resident naturalists, departing each morning from your villa.",
  },
  {
    no: "02",
    title: "Culinary Residency",
    description:
      "Farm-to-table tasting menus prepared in-villa by our resident chefs, featuring produce from the Hulu Langat valley.",
  },
  {
    no: "03",
    title: "Wellness Circuit",
    description:
      "Private yoga at dawn, in-villa spa therapies, and meditation decks oriented toward the morning light.",
  },
];

export function Experiences() {
  return (
    <section className="w-full bg-surface-container">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
            Experiences
          </h2>
          <LabelCaps>04 / EXPERIENCES</LabelCaps>
        </div>
        <Divider className="mt-6" />

        <div className="mt-8">
          {EXPERIENCES.map((item, i) => (
            <div key={item.no}>
              {i > 0 && <Divider />}
              <div className="grid gap-4 py-8 transition-colors hover:bg-surface-container-low lg:grid-cols-[80px_1fr_2fr] lg:items-baseline">
                <span className="text-mono-data text-on-surface-variant">
                  {item.no}
                </span>
                <h3 className="text-base font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.6] text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
