# Guest Responsive + A11y + Anti-Slop QA Notes (Plan 2, Task 7)

Method: code inspection of every guest component/page, `globals.css`,
`tokens.css`, and UI primitives against the plan 2 constraints and spec §9,
plus scripted WCAG contrast computation over the token pairs. Scope:
`/` (hero, featured sanctuary, collection, experiences, press quote),
`/villas`, `/villas/[slug]`, shared chrome (TopNavBar, MobileNavDrawer,
Footer).

## Responsive (390 / 768 / 1280 / 1440)

| Check | Result |
| --- | --- |
| Nav collapses to hamburger + drawer below `lg`; drawer is `w-72 max-w-[85vw]` | PASS (`TopNavBar` hidden nav `< lg`, `MobileNavDrawer` `lg:hidden`) |
| Hero headline swaps to `display-lg-mobile` 40px below `lg`; 5% gutters both sides (`ml-[5%] mr-[5%]`) | PASS |
| Collection grid 3-col → 1-col; section margins 20px mobile (`px-5`) | PASS (`TheCollection` `lg:grid-cols-3`) |
| Curated experiences 4-col → stacked, vertical hairlines become horizontal | PASS (`lg:grid-cols-4`, `border-t … lg:border-l lg:border-t-0`) |
| Featured sanctuary 62/38 grid → stacked | PASS (`lg:grid-cols-[62fr_38fr]`) |
| Property gallery: desktop hero+2×2 grid; mobile horizontal scroll-snap (85% slides, `snap-x snap-mandatory`) | PASS (`PropertyGallery` mobile/desktop variants) |
| Booking card stacks below content on mobile, sticky right column `lg:sticky lg:top-24` | PASS (detail page grid `lg:grid-cols-[1fr_380px]`) |
| Footer rows stack (`flex-col` → `sm:flex-row`) | PASS |
| Villas index 2-col → 1-col | PASS |
| Containers `max-w-[1280px]` centered; no fixed widths that overflow at 390px | PASS |

## Contrast (WCAG 2.1 computed ratios, normal text ≥ 4.5:1)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `on-primary-container` `#95a397` on `primary` `#18241b` (press-quote meta — the plan-flagged sage-on-dark risk) | 6.09:1 | PASS — no bump to `primary-fixed` needed |
| `primary-fixed-dim` `#bccabd` on `primary` (decorative glyph / hairline) | 9.43:1 | PASS (decorative anyway) |
| `inverse-on-surface` `#f2f0f0` on `primary` (quote body) | 14.15:1 | PASS |
| `on-primary` on `primary` / `primary-container` (CTAs, attribution) | 16.07 / 12.07:1 | PASS |
| `on-surface-variant` `#434843` on `surface` / `surface-container` / `surface-container-low` | 8.91 / 8.01 / 8.46:1 | PASS |
| Badge tones after tokenization (`primary-container` text on `primary-fixed`; `on-surface-variant` on `secondary-fixed`; `error` on `error-container`) | 9.34 / 7.26 / 5.00:1 | PASS |

`outline-variant` borders are non-text (1.62:1) — allowed; they are not the
sole indicator of any state.

## Keyboard / focus

- Tab order is source order: wordmark → nav links → CTA → hero CTA → cards → footer; no positive `tabindex` anywhere.
- **Finding (fixed):** no global `:focus-visible` rule existed in `globals.css`, and `Button`, `Input`, and the ReviewsSection ghost link lacked ring classes. Added global `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` plus explicit `focus-visible:` classes on those components. All other guest links/buttons already carried them.
- Mobile drawer is a `role="dialog" aria-modal` with labelled open/close buttons (`aria-label` + `aria-expanded`).

## Reduced motion

- Only client-motion leaf is `MobileNavDrawer`; it uses `useReducedMotion()` and swaps slide animation for instant open/close. **PASS**
- No other `motion/react`, `whileInView`, or CSS animation usage in guest code (grep-verified).
- **Finding (fixed):** no CSS safety net — added `prefers-reduced-motion: reduce` block to `globals.css` zeroing transition/animation durations.

## Anti-slop sweep

- **Hardcoded hex (fixed):** `Badge.tsx` used raw `#d8e6d9/#2d3930/#e2e3e1/#434843/#ffdad6/#ba1a1a`; replaced with tokens (`primary-fixed`, `primary-container`, `secondary-fixed`, `on-surface-variant`, `error-container`, `error`). `Divider.tsx` used `bg-[#E0E0E0]`; spec §3.4 sanctions this hairline color, so it was tokenized as `--color-hairline` and switched to `bg-hairline` — zero rendered-value change. Remaining hex usage: `MapCard` (documented MapLibre style JSON + marker, plan-sanctioned) and comment references only.
- No lorem ipsum, TODO/FIXME, "coming soon", console.log, debugger, drop shadows, or emojis in authored source (Prisma-generated banner emoji excluded).
- Copy remains verbatim from spec §8 ("Discrete Concierge" spelling preserved); no generic AI filler introduced.

## Deferred / documented (not findings)

- "Show all 128 reviews" links `#` — reviews modal is spec §10 phase 2, comment documents it.
- MapCard raster-grayscale approach vs vector water/road layers — documented inline; requires tile server, out of scope.
- `HandConcierge` glyph unavailable in pinned `@phosphor-icons/react` 2.x — `Bell` used, documented inline.
- Booking card date/guest widgets are presentational — interactive flow is Plan 3.
- Manual device pass (Playwright viewport screenshots + physical tab-through) deferred to Plan 3 final QA; this pass was code-inspection-based per task brief.
