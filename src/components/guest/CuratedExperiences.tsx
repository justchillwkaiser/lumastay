import {
  Bell,
  FlowerLotus,
  ForkKnife,
  Waves,
} from "@phosphor-icons/react/dist/ssr";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

// Frontpage Curated Experiences band (plan 2 task 3, per mockup Main.png):
// white bg; headline-md + subcopy max-w-[420px]; one bordered row of 4 cells
// with vertical hairline dividers, no radius. Copy VERBATIM from spec §8
// ("Discrete Concierge" spelling preserved intentionally).
//
// Note: plan calls for the HandConcierge glyph, but @phosphor-icons/react
// (repo-pinned 2.x) has no HandConcierge/BellConcierge export — Bell is the
// closest concierge-bell glyph, documented here per plan 2 task 3's icon list.
interface AmenityCell {
  icon: PhosphorIcon;
  label: string;
  description: string;
}

const AMENITY_CELLS: AmenityCell[] = [
  {
    icon: Waves,
    label: "Private Pools",
    description: "Architecturally integrated infinity pools in every sanctuary.",
  },
  {
    icon: ForkKnife,
    label: "Organic Kitchen",
    description: "Farm-to-table dining experiences prepared by resident chefs.",
  },
  {
    icon: Bell,
    label: "Discrete Concierge",
    description: "Anticipatory service ensuring total privacy and convenience.",
  },
  {
    icon: FlowerLotus,
    label: "In-Villa Spa",
    description:
      "Therapeutic treatments delivered in the comfort of your retreat.",
  },
];

export function CuratedExperiences() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
      <h2 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-surface">
        Curated Experiences
      </h2>
      <p className="mt-4 max-w-[420px] text-body-md leading-body-md text-on-surface-variant">
        Every detail engineered for profound relaxation and effortless living.
      </p>

      <div className="mt-10 grid border border-outline-variant lg:grid-cols-4">
        {AMENITY_CELLS.map((cell, index) => {
          const CellIcon = cell.icon;
          return (
            <div
              key={cell.label}
              className={
                index === 0
                  ? "p-6"
                  : "border-t border-outline-variant p-6 lg:border-l lg:border-t-0"
              }
            >
              <CellIcon
                size={24}
                strokeWidth={1.5}
                aria-hidden="true"
                className="text-on-surface"
              />
              <h3 className="mt-4 text-base font-semibold text-on-surface">
                {cell.label}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-on-surface-variant">
                {cell.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
