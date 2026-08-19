import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

import { LabelCaps } from "@/components/ui/LabelCaps";

const TABS = [
  { label: "Overview", disabled: false },
  { label: "Analytics", disabled: true }, // phase 2 stub (plan 3 task 7)
  { label: "Operations", disabled: true }, // phase 2 stub
];

// Admin top bar (plan 3 task 7): tabs (Analytics/Operations aria-disabled
// stubs), search decor, bell / DotsNine / Question / avatar right.
export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline bg-surface px-6">
      <nav aria-label="Admin sections" className="flex items-center gap-6">
        {TABS.map((tab) =>
          tab.disabled ? (
            <span
              key={tab.label}
              aria-disabled="true"
              title="Coming in phase 2"
              className="cursor-not-allowed pb-1 text-label-caps font-bold uppercase leading-none tracking-[0.1em] text-on-surface-variant opacity-50"
            >
              {tab.label}
            </span>
          ) : (
            <LabelCaps
              key={tab.label}
              as="span"
              className="border-b-2 border-primary pb-1 text-on-surface"
            >
              {tab.label}
            </LabelCaps>
          ),
        )}
      </nav>

      <div className="flex items-center gap-4">
        <form action="/admin/bookings" method="get" className="relative hidden md:block">
          <MagnifyingGlass
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="search"
            name="search"
            aria-label="Search bookings"
            placeholder="Search bookings…"
            className="w-56 rounded border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </form>
        <span
          aria-label="Admin user"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-label-caps font-bold text-on-primary"
        >
          A
        </span>
      </div>
    </header>
  );
}
