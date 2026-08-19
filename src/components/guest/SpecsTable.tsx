import { LabelCaps } from "@/components/ui/LabelCaps";
import type { PropertySpecItem } from "@/lib/seed-fallback";

export interface SpecsTableProps {
  specs: PropertySpecItem[];
}

// Specifications table (plan 2 task 6, per mockup secondpage): headline-sm,
// 1px outer border, LabelCaps label left (~30%) + mono-data value right,
// bottom-border-only row separators (taste-skill list rule).
export function SpecsTable({ specs }: SpecsTableProps) {
  return (
    <section aria-labelledby="specs-heading">
      <h2
        id="specs-heading"
        className="text-headline-sm font-semibold leading-headline-sm tracking-headline-sm text-on-surface"
      >
        Property Specifications
      </h2>
      <dl className="mt-6 rounded border border-outline-variant">
        {specs.map((spec, index) => (
          <div
            key={spec.label}
            className={[
              "grid grid-cols-[30%_1fr] gap-4 px-5 py-4",
              index < specs.length - 1 ? "border-b border-outline-variant" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <dt>
              <LabelCaps as="span">{spec.label}</LabelCaps>
            </dt>
            <dd className="text-mono-data font-normal leading-mono-data text-on-surface">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
