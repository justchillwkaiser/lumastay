// Frontpage press quote band (plan 2 task 3, per mockup Main.png):
// full-bleed dark section. Token decision (documented per plan): mockup shows
// #161F1A; the closest design-system role is `primary` #18241B (dark green
// surface), so the band uses bg-primary — NOT inverse-surface #303031, which
// is a neutral gray and would lose the green cast. Decorative serif quote
// glyph + sage text use primary-fixed-dim (#bccabd); attribution meta uses
// on-primary-container (#95a397, sage gray, >=4.5:1 on primary).
// Quote + attribution VERBATIM from spec §8.
export function PressQuote() {
  return (
    <section className="w-full bg-primary py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
        <div className="lg:pl-[8%]">
          <span
            aria-hidden="true"
            className="block font-serif text-[64px] leading-none text-primary-fixed-dim"
          >
            &ldquo;
          </span>
          <blockquote className="mt-6 max-w-[530px] text-[28px] font-medium leading-[1.4] tracking-[-0.01em] text-inverse-on-surface">
            A masterclass in restraint. The architecture doesn&apos;t compete
            with the landscape; it frames it. An incredibly grounding experience
            that redefines modern luxury.
          </blockquote>
          <div className="mt-10 flex items-center gap-5">
            <span aria-hidden="true" className="h-px w-[34px] bg-primary-fixed-dim" />
            <div>
              <p className="text-sm font-semibold text-on-primary">
                Monocle Magazine
              </p>
              <p className="mt-1 text-sm text-on-primary-container">
                Travel Issue, 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
