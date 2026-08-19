import { Divider } from "@/components/ui/Divider";
import { LabelCaps } from "@/components/ui/LabelCaps";

// Frontpage section 05 / SUSTAINABILITY (frontpage polish): statement +
// 3-column metrics grid (mono-data values). Primary-container dark band for
// tonal contrast before the press quote.
const METRICS = [
  { value: "100%", label: "Rainwater Harvested" },
  { value: "-40%", label: "Energy vs. Conventional" },
  { value: "87%", label: "Local Materials" },
];

export function Sustainability() {
  return (
    <section className="w-full bg-primary-container">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-20 lg:px-10 lg:py-24">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="text-headline-md font-semibold leading-headline-md tracking-headline-md text-on-primary">
            Sustainability
          </h2>
          <LabelCaps className="text-on-primary-container">
            05 / SUSTAINABILITY
          </LabelCaps>
        </div>
        <Divider className="mt-6 bg-on-primary-container opacity-30" />

        <p className="mt-10 max-w-[560px] text-[22px] font-medium leading-[1.4] tracking-[-0.01em] text-on-primary">
          Every LumaStay villa is designed to exist lightly on the land —
          passive cooling, harvested rainwater, and materials sourced within
          100 kilometres.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {METRICS.map((m) => (
            <div key={m.label}>
              <p className="text-mono-data text-[32px] font-bold leading-none text-on-primary">
                {m.value}
              </p>
              <LabelCaps className="mt-3 block text-on-primary-container">
                {m.label}
              </LabelCaps>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
