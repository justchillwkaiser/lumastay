# LumaStay — Guest-Facing Surfaces Implementation Plan (Plan 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all guest-facing pages pixel-faithful to mockups: frontpage, villas index, property detail, and shared guest chrome (TopNavBar, Footer).

**Architecture:** RSC-first pages querying Prisma via service functions with seed-fallback. Client leaves only for motion (`motion/react`, `whileInView`, `useReducedMotion`) and interactive widgets (booking card date/guest pickers are Plan 3; here the booking card is presentational + links to `/book/dates`). All styling via tokens from Plan 1 — no hardcoded hex.

**Tech Stack:** Next.js 16 RSC · Tailwind v4 tokens · motion/react · @phosphor-icons/react · next/image

**Spec:** `docs/specs/2026-08-19-lumastay-design.md` (§3 design system, §4.1 routes, §8 seed copy)
**Depends on:** Plan 1 (`docs/superpowers/plans/2026-08-19-lumastay-01-foundation.md`) — tokens, db, seed-fallback, UI primitives

## Global Constraints

- All copy VERBATIM from spec §8 (brand-swapped to LumaStay); trailing periods preserved; "Discrete Concierge" spelling preserved
- Zero drop shadows; depth = 1px `outline-variant` borders + tonal shifts only
- Radius: cards 4px, gallery images 8px, buttons 4px — one system
- Hero headline line 3 in faded sage tone (`primary` at ~50% → use `primary-fixed-dim` `#bccabd` blended or opacity-50 of headline color); NOT a gradient mask
- Hero: `min-h-[100dvh]`, white scrim `linear-gradient(to top, rgba(255,255,255,.85), rgba(255,255,255,.4) 20%, transparent 45%)`, content left gutter 5%
- Eyebrows exactly as designed: `01 / SPOTLIGHT`, `02 / DISCOVER` (intentional art direction — taste-skill 9.F overridden by brief)
- Footer text-only: no newsletter, no social icons, no dividers
- Icons: @phosphor-icons/react only, strokeWidth 1.5
- Mobile: explicit collapse per section (4-col grid, 20px margins); nav → hamburger + drawer
- `next/image` with reserved dimensions (CLS < 0.1); hero image `priority`
- Server data functions: try/catch → seed-fallback (offline build-safe)
- Verification per task: `npm run typecheck && npm test && npm run build` + render check (dev server + curl HTML grep)

---

### Task 1: Guest chrome — TopNavBar + Footer + guest layout

**Files:**
- Create: `src/components/guest/TopNavBar.tsx`, `src/components/guest/MobileNavDrawer.tsx`, `src/components/guest/Footer.tsx`, `src/app/(guest)/layout.tsx`, `tests/guest-chrome.test.tsx`

**Interfaces:**
- Produces: `<TopNavBar active="villas" />`, `<Footer />` used by all guest pages; `(guest)` route group layout wrapping both

- [x] **Step 1: Write failing test**

`tests/guest-chrome.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TopNavBar } from "@/components/guest/TopNavBar";
import { Footer } from "@/components/guest/Footer";

describe("guest chrome", () => {
  it("navbar has brand + 4 links + CTA", () => {
    render(<TopNavBar active="villas" />);
    expect(screen.getByText("LUMASTAY")).toBeTruthy();
    for (const l of ["Our Heritage", "The Villas", "Experiences", "Sustainability"])
      expect(screen.getByText(l)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book Your Stay" })).toBeTruthy();
  });
  it("active link has underline style", () => {
    render(<TopNavBar active="villas" />);
    expect(screen.getByText("The Villas").className).toContain("underline");
  });
  it("CTA uses primary-container green", () => {
    render(<TopNavBar active="villas" />);
    expect(screen.getByRole("link", { name: "Book Your Stay" }).className)
      .toContain("bg-primary-container");
  });
  it("footer is text-only with verbatim legal copy", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 LUMASTAY MALAYSIA\./)).toBeTruthy();
    expect(screen.getByText(/ARCHITECTURAL PERMANENCE\./)).toBeTruthy();
    for (const l of ["Privacy Policy", "Terms of Service", "Press Kit", "Contact"])
      expect(screen.getByText(l)).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull(); // no newsletter input
  });
});
```

- [x] **Step 2: Run test — verify FAIL**

Run: `npm test` → FAIL (components missing)

- [x] **Step 3: Implement**

TopNavBar (per mockup): solid `surface` bg, ~88px h, 1px bottom border; wordmark `LUMASTAY` 18px/500/uppercase/0.15em tracking, left 40px; center links 13–14px `on-surface-variant`, active = `on-surface` + 1px underline offset 4px; right CTA `Book Your Stay` bg `primary-container` text white radius 4px px-7 py-3, right 40px; single line at lg; hamburger < lg opens `MobileNavDrawer` (client leaf: slide-in drawer, × close, same links, motion with useReducedMotion collapse).

Footer (per mockup): `surface-container-low` bg; row 1: wordmark left (13px/500/0.15em), 4 links right (12px/600, gap 40px); row 2 (~38px below): two legal lines uppercase 11.5px/0.12em `on-surface-variant`. Nothing else.

`(guest)/layout.tsx`: `<TopNavBar active={...} />` per-segment via layout per page section (pass active via per-page layouts or pathname client hook in a small client leaf); `<Footer />` after children.

- [x] **Step 4: Run test — verify PASS + build**

Run: `npm test && npm run typecheck && npm run build`

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: guest chrome (topnavbar, drawer, footer)"
```

---

### Task 2: Frontpage — Hero + Featured Sanctuary

**Files:**
- Create: `src/components/guest/Hero.tsx`, `src/components/guest/FeaturedSanctuary.tsx`, `src/app/(guest)/page.tsx`, `tests/frontpage.test.tsx`
- Modify: `src/lib/seed-fallback.ts` (add `heroCopy` export)

**Interfaces:**
- Consumes: `fallbackProperties` (Plan 1 Task 5), UI primitives (Plan 1 Task 6)
- Produces: `/` route sections 1–3 (hero, navbar via layout, featured sanctuary)

- [x] **Step 1: Write failing test**

`tests/frontpage.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Hero } from "@/components/guest/Hero";
import { FeaturedSanctuary } from "@/components/guest/FeaturedSanctuary";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("hero", () => {
  it("renders verbatim 3-line headline with faded third line", () => {
    render(<Hero />);
    expect(screen.getByText("Architectural")).toBeTruthy();
    expect(screen.getByText("Permanence.")).toBeTruthy();
    const line3 = screen.getByText("Natural Serenity.");
    expect(line3.className).toMatch(/opacity-50|text-primary-fixed-dim/);
  });
  it("renders subcopy + underline text-link CTA", () => {
    render(<Hero />);
    expect(screen.getByText(/curated collection of minimalist sanctuaries/)).toBeTruthy();
    const cta = screen.getByRole("link", { name: /Discover Our Villas/ });
    expect(cta.className).toContain("underline");
  });
});

describe("featured sanctuary", () => {
  it("renders pavilion card with verbatim copy + price", () => {
    render(<FeaturedSanctuary property={fallbackProperties[0]} />);
    expect(screen.getByText(/The Pavilion at Hulu/)).toBeTruthy();
    expect(screen.getByText("Featured Sanctuary")).toBeTruthy();
    expect(screen.getByText("01 / SPOTLIGHT")).toBeTruthy();
    expect(screen.getByText(/RM 3,200/)).toBeTruthy();
    expect(screen.getByText(/architectural marvel suspended above/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore Villa" })).toBeTruthy();
  });
});
```

- [x] **Step 2: Run test — verify FAIL**

- [x] **Step 3: Implement**

Hero (per mockup measurements): `relative min-h-[100dvh]`, `next/image fill priority` (picsum `lumastay-hero` seed, 1600×900), scrim overlay div, content absolute bottom-left: left gutter `left-[5%]`, stack = display-lg headline 3 lines (`<br>` explicit; line3 `opacity-50`), gap 32px, subcopy `body-md` max-w-[420px] `on-surface-variant`, gap 36px, CTA text-link 14px/600 underline offset-4 with `ArrowDown` phosphor icon, bottom clearance ~10vh. Mobile: display-lg-mobile 40px.

FeaturedSanctuary (per mockup): section container max-w-[1280px] px margins; header row flex baseline: headline-md "Featured Sanctuary" left, LabelCaps "01 / SPOTLIGHT" right; Divider; grid `lg:grid-cols-[62fr_38fr]` gap-8; left: image 4:3 `next/image` with LabelCaps "RESORT" tag absolute top-left 10px white; right: Card p-8 — headline-sm "The Pavilion at Hulu Langat" + inline `★ 4.9` outlined pill, location row (`MapPin` icon + "Hulu Langat, Selangor, Malaysia"), body-md description, Divider, price row ("Starting from" / "**RM 3,200** / night"), ghost Button "Explore Villa" → `/villas/the-pavilion`.

`page.tsx` (RSC): try/catch DB fetch featured property → fallback; render Hero + FeaturedSanctuary.

- [x] **Step 4: Run test — PASS + render check**

```bash
npm test && npm run build
npm run dev & sleep 5; curl -s http://localhost:3000/ | grep -o "Natural Serenity." ; kill %1
```

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: frontpage hero + featured sanctuary"
```

---

### Task 3: Frontpage — The Collection + Curated Experiences + Press Quote

**Files:**
- Create: `src/components/guest/VillaCard.tsx`, `src/components/guest/TheCollection.tsx`, `src/components/guest/CuratedExperiences.tsx`, `src/components/guest/PressQuote.tsx`, `tests/frontpage-sections.test.tsx`
- Modify: `src/app/(guest)/page.tsx`

**Interfaces:**
- Produces: `<VillaCard>` (reused by `/villas` index), remaining frontpage sections

- [x] **Step 1: Write failing test**

`tests/frontpage-sections.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TheCollection } from "@/components/guest/TheCollection";
import { CuratedExperiences } from "@/components/guest/CuratedExperiences";
import { PressQuote } from "@/components/guest/PressQuote";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("the collection", () => {
  it("renders 3 villa cards with names, prices, meta", () => {
    render(<TheCollection properties={fallbackProperties.slice(1)} />);
    expect(screen.getByText("The Collection")).toBeTruthy();
    expect(screen.getByText("02 / DISCOVER")).toBeTruthy();
    expect(screen.getByText("Courtyard House")).toBeTruthy();
    expect(screen.getByText(/RM 950\+/)).toBeTruthy();
    expect(screen.getByText("Janda Baik, Pahang")).toBeTruthy();
    expect(screen.getByText("2 Beds")).toBeTruthy();
    expect(screen.getByText("Limestone Retreat")).toBeTruthy();
    expect(screen.getByText("The Horizon Villa")).toBeTruthy();
    expect(screen.getByRole("link", { name: "View Full Collection" })).toBeTruthy();
  });
});

describe("curated experiences", () => {
  it("renders 4 amenity cells with verbatim copy", () => {
    render(<CuratedExperiences />);
    expect(screen.getByText("Curated Experiences")).toBeTruthy();
    expect(screen.getByText(/Every detail engineered for profound relaxation/)).toBeTruthy();
    for (const l of ["Private Pools", "Organic Kitchen", "Discrete Concierge", "In-Villa Spa"])
      expect(screen.getByText(l)).toBeTruthy();
    expect(screen.getByText(/Anticipatory service ensuring total privacy/)).toBeTruthy();
  });
});

describe("press quote", () => {
  it("renders verbatim quote + attribution on dark band", () => {
    render(<PressQuote />);
    expect(screen.getByText(/masterclass in restraint/)).toBeTruthy();
    expect(screen.getByText("Monocle Magazine")).toBeTruthy();
    expect(screen.getByText("Travel Issue, 2024")).toBeTruthy();
  });
});
```

- [x] **Step 2: Run test — verify FAIL**

- [x] **Step 3: Implement**

VillaCard (per mockup): no container card — flat on `surface-container` section bg; image 4:3 sharp corners; row below: name body-md/600 left + price `mono-data` `on-surface-variant` right; Card (white, 1px border, p-5) below with location (14px/500), Divider, meta row (`Bed` icon + "N Beds", feature icon + label 12px gray). Whole card wrapped in link to `/villas/[slug]`.

TheCollection: `surface-container` bg section; header row + divider (as FeaturedSanctuary); 3-col grid gap-5 (cards = VillaCard); centered ghost Button "View Full Collection" → `/villas`, mt-11.

CuratedExperiences: white bg; headline-md + subcopy max-w-[420px]; bordered row grid-cols-4 with vertical hairline dividers: icon (Waves, ForkKnife, HandConcierge, FlowerLotus — phosphor, 24px, 1.5 stroke) top-left + label 16px/600 + description 13px `on-surface-variant` per verbatim copy; outer 1px border, no radius.

PressQuote: full-bleed `bg-primary` (#161F1A appearance — use `inverse-surface`/`primary` token, verify against mockup `#161F1a` and document chosen token) section py-24; decorative serif `"` glyph sage; quote ~28px off-white max-w-[530px] left-inset; 34px hairline + attribution ("Monocle Magazine" white/600, "Travel Issue, 2024" sage gray).

Update `page.tsx` to compose all sections in order.

- [x] **Step 4: Run test — PASS + render check (grep "Discrete Concierge")**

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: frontpage collection, experiences, press quote"
```

---

### Task 4: Villas index page

**Files:**
- Create: `src/app/(guest)/villas/page.tsx`, `tests/villas-index.test.tsx`

**Interfaces:**
- Consumes: `VillaCard` (Task 3), service fn `listProperties()` (create in `src/lib/properties.ts` with fallback)

- [x] **Step 1: Write failing test**

`tests/villas-index.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { listProperties } from "@/lib/properties";

describe("listProperties", () => {
  it("returns 4 active villas ordered for collection", async () => {
    const list = await listProperties();
    expect(list).toHaveLength(4);
    expect(list.map(p => p.slug)).toContain("the-pavilion");
  });
});
```

- [x] **Step 2: Run test — verify FAIL**

- [x] **Step 3: Implement**

`src/lib/properties.ts`:
```ts
import { db } from "@/lib/db";
import { fallbackProperties, type PropertyCardData } from "@/lib/seed-fallback";

export async function listProperties(): Promise<PropertyCardData[]> {
  try {
    const rows = await db.property.findMany({
      where: { isActive: true },
      include: { amenities: true, images: true },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) return fallbackProperties;
    return rows.map(/* map to PropertyCardData */);
  } catch {
    return fallbackProperties;
  }
}
```

`villas/page.tsx` (RSC): `metadata` title "The Villas"; header block (headline-md "The Villas" + subcopy "A curated collection of minimalist sanctuaries."); 2-col grid (lg) of VillaCard for all 4 properties; generous `py-24`; Divider between header and grid.

- [x] **Step 4: Run test — PASS + render check (`curl /villas | grep "Horizon Villa"`)**

- [x] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: villas index page"
```

---

### Task 5: Property detail — gallery + header + booking card (presentational)

**Files:**
- Create: `src/app/(guest)/villas/[slug]/page.tsx`, `src/components/guest/PropertyGallery.tsx`, `src/components/guest/BookingCard.tsx`, `src/lib/properties.ts` (add `getPropertyBySlug`), `tests/property-detail.test.tsx`

**Interfaces:**
- Produces: `/villas/[slug]` top half: H1 + meta, 5-image gallery, hosted-by + description, sticky BookingCard (presentational — "RESERVE NOW" links to `/book/dates?property=<slug>`)
- `getPropertyBySlug(slug): Promise<PropertyCardData | null>` (fallback-safe)

- [ ] **Step 1: Write failing test**

`tests/property-detail.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { getPropertyBySlug } from "@/lib/properties";
import { BookingCard } from "@/components/guest/BookingCard";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("property detail", () => {
  it("getPropertyBySlug returns pavilion with specs + amenities", async () => {
    const p = await getPropertyBySlug("the-pavilion");
    expect(p?.name).toBe("The Pavilion at Hulu Langat");
    expect(p?.specs.map(s => s.label)).toContain("TOTAL AREA");
    expect(p?.amenities.map(a => a.label)).toContain("Infinity Pool");
  });
  it("returns null for unknown slug", async () => {
    expect(await getPropertyBySlug("nope")).toBeNull();
  });
  it("booking card shows nightly rate + reserve CTA link", () => {
    render(<BookingCard property={fallbackProperties[0]} />);
    expect(screen.getByText(/RM 3,200/)).toBeTruthy();
    expect(screen.getByText("/ night")).toBeTruthy();
    expect(screen.getByText("You won't be charged yet")).toBeTruthy();
    const cta = screen.getByRole("link", { name: "RESERVE NOW" });
    expect(cta.getAttribute("href")).toContain("/book/dates");
    expect(cta.className).toContain("bg-primary");
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

Page (RSC, `params` Promise awaited): `notFound()` on null; `generateMetadata` per property.

Header: headline-md `The Pavilion at Hulu Langat`; meta row: `Star` (fill) + "**4.95** (128 reviews)" + `•` + `MapPin` + locationLine.

PropertyGallery: grid `lg:grid-cols-2` — left hero image full height; right `grid-cols-2 grid-rows-2` 4 images; all radius 8px, gap 2, reserved aspect (hero 4:3, tiles 4:3); mobile: horizontal scroll-snap row.

Hosted-by row: headline-sm "Entire villa hosted by LumaStay", meta "8 guests • 4 bedrooms • 4 beds • 4.5 baths", host avatar circle right (picsum seed). Description body-lg verbatim. Divider.

BookingCard (sticky `lg:sticky lg:top-24`): Card p-6 — price line (`mono-data` 24px/700 "RM 3,200" + "/ night"); date display boxes (CHECK-IN / CHECK-OUT LabelCaps + "Select date" placeholder — interactive in Plan 3, here static presentational linking to `/book/dates?property=slug`); GUESTS box; primary Button "RESERVE NOW" full-width uppercase tracking → `/book/dates?property=the-pavilion`; centered note "You won't be charged yet".

- [ ] **Step 4: Run test — PASS + render check**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: property detail gallery + booking card"
```

---

### Task 6: Property detail — amenities + specs + map + reviews

**Files:**
- Create: `src/components/guest/AmenitiesGrid.tsx`, `src/components/guest/SpecsTable.tsx`, `src/components/guest/MapCard.tsx`, `src/components/guest/ReviewsSection.tsx`, `src/lib/reviews.ts`, `tests/property-sections.test.tsx`
- Modify: `src/app/(guest)/villas/[slug]/page.tsx`

**Interfaces:**
- Produces: bottom half of detail page; `listApprovedReviews(propertySlug)` with fallback (James/Sarah verbatim)

- [ ] **Step 1: Write failing test**

`tests/property-sections.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AmenitiesGrid } from "@/components/guest/AmenitiesGrid";
import { SpecsTable } from "@/components/guest/SpecsTable";
import { listApprovedReviews } from "@/lib/reviews";
import { fallbackProperties } from "@/lib/seed-fallback";

describe("amenities + specs", () => {
  it("renders 6 amenities in 2x3 grid", () => {
    render(<AmenitiesGrid amenities={fallbackProperties[0].amenities} />);
    expect(screen.getByText("What this place offers")).toBeTruthy();
    for (const a of ["Infinity Pool", "High-speed Wi-Fi", "Chef's Kitchen",
      "Private Parking", "Central Air Conditioning", "Media Room"])
      expect(screen.getByText(a)).toBeTruthy();
  });
  it("specs table renders verbatim label/value pairs", () => {
    render(<SpecsTable specs={fallbackProperties[0].specs} />);
    expect(screen.getByText("Property Specifications")).toBeTruthy();
    expect(screen.getByText("TOTAL AREA")).toBeTruthy();
    expect(screen.getByText("4,500 sq ft")).toBeTruthy();
    expect(screen.getByText("MATERIALS")).toBeTruthy();
    expect(screen.getByText("Off-form Concrete, Merbau Timber")).toBeTruthy();
  });
});

describe("reviews", () => {
  it("fallback returns James + Sarah verbatim", async () => {
    const reviews = await listApprovedReviews("the-pavilion");
    expect(reviews.map(r => r.guestName)).toContain("James");
    expect(reviews.map(r => r.guestName)).toContain("Sarah");
    expect(reviews[0].body).toContain("Immaculate architecture");
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Implement**

AmenitiesGrid: headline-sm; `grid-cols-2` (mobile 1) rows: icon 24px phosphor + label body-md; Dividers around section.

SpecsTable: headline-sm; bordered table: rows LabelCaps label left (~30% col) + value `mono-data` right; 1px row separators (bottom-border only, per taste-skill list rule); outer 1px border.

MapCard: headline-sm "Location"; Card: LabelCaps header "THE PAVILION | LUMASTAY" + `MapPin` "Location Overview"; MapLibre client leaf (`"use client"`, grayscale style JSON inline: `background` white, water `#e9e8e7`, roads `#c3c8c2`; dark green marker at Hulu Langat approx 3.113, 101.815); lazy-load maplibre CSS; static fallback image if WebGL unavailable. Height ~16:9.

ReviewsSection: header `Star` fill + "**4.95** · 128 reviews" headline-sm; 2-col review cards (avatar circle initial, name 14px/600, date 13px gray, body 14px) from `listApprovedReviews` (max 2 shown); ghost Button "Show all 128 reviews" sharp 4px (links `#` stub → phase 2 modal).

Compose into detail page below gallery section; right column BookingCard sticky alongside.

- [ ] **Step 4: Run test — PASS + build + render check (`curl /villas/the-pavilion | grep "Merbau"`)**

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: property amenities, specs, map, reviews"
```

---

### Task 7: Guest responsive + a11y QA pass

**Files:**
- Modify: any component failing checks
- Create: `tests/a11y-notes.md`

- [ ] **Step 1: Manual + scripted checks**

- Viewport sweep 390/768/1280/1440 via Playwright screenshot script (`npx playwright screenshot --viewport-size=390,844 http://localhost:3000/ ...`): nav drawer, hero readable (display-lg-mobile), collection 1-col, gallery scroll-snap, booking card stacked below content, footer stacked.
- Contrast spot-check with `designmd lint` on any adjusted tokens; verify sage-on-dark quote text ≥ 4.5:1 (if not, bump to `primary-fixed` `#d8e6d9`).
- Keyboard: tab order hero CTA → cards → footer; focus-visible rings on all links/buttons (`outline: 2px solid primary`, offset 2px — add to globals if missing).
- `prefers-reduced-motion`: verify drawer/reveals static (grep components for `useReducedMotion`).

- [ ] **Step 2: Fix findings in one batch; re-run checks once**

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm test && npm run build` — all green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: guest responsive + a11y qa pass"
```

---

## Self-Review

**Spec coverage (Plan 2):** §4.1 routes `/`, `/villas`, `/villas/[slug]` (Tasks 2–6) · §3.4 signature details 1, 2, 5, 6, 7 (Tasks 2, 1, 3) · §8 copy (all tasks) · §9 a11y/responsive/perf (Task 7) · chrome (Task 1). Booking flow + admin → Plan 3.

**Placeholder scan:** MapCard grayscale style JSON is defined inline at implementation (spec gives token colors; exact MapLibre style object written in Task 6 Step 3 from those tokens — no external dependency). "Show all reviews" explicitly stubbed to phase 2 per spec §10.

**Type consistency:** `PropertyCardData` (Plan 1) consumed everywhere; `listProperties`/`getPropertyBySlug`/`listApprovedReviews` names consistent across tests and implementations; BookingCard href `/book/dates?property=` matches Plan 3 route.

**Known deferrals (per spec §10 Phase 2):** room-type pricing, reviews modal, email, interactive booking card widgets (Plan 3 owns the booking flow itself).
