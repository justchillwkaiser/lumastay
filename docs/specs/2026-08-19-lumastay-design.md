# LumaStay — Product & Design Specification

**Date:** 2026-08-19
**Status:** Approved for planning
**Working name in mockups:** RHU RESORT → production brand: **LumaStay**
**Design source of truth:** `designs/` (27 files) + `designs/DESIGN.md` (token spec)
**Scope source:** `designs/SCOPE.md`

---

## 1. Product Summary

LumaStay is a premium Malaysian resort booking platform (hospitality e-commerce). Guests browse architecturally-driven villas, select dates through a 5-step booking flow, and confirm a reservation. Staff manage bookings, availability, properties, guests, payments, and reviews through an admin dashboard. The visual language is **International Typographic Style (Swiss UI)** adapted for luxury Malaysian hospitality: monochrome-dominant, single forest-green accent, hairline borders, zero drop shadows, Inter exclusively.

**Modes (impeccable framework):**
- Guest-facing surfaces = **Persuade** (editorial, imagery-led, conversion to booking)
- Admin surfaces = **Operate** (scanability, density, task completion)

---

## 2. Decisions Locked (from briefing)

| # | Decision | Choice |
|---|---|---|
| 1 | Component library | **Vanilla + Tailwind v4** — no shadcn; every component built pixel-faithful to mockups |
| 2 | Payments | **MockPaymentProvider + PaymentProvider abstraction**; manual "Record Payment" in admin is first-class; swap to ToyyibPay/Billplz later |
| 3 | Property scope | **Multi-property full** — 4 villas bookable, Collection page, admin manages all |
| 4 | Auth model | **Guest checkout without account** (email-linked), **optional guest account** to claim booking history; Better Auth accounts for admin/staff |

---

## 3. Design System (normative)

Tokens live in `designs/DESIGN.md` (Google DESIGN.md spec). At scaffold time these are exported to a Tailwind v4 `@theme` block via `npx @google/design.md export --format css-tailwind` and linted for WCAG contrast (`lint`). That generated `tokens.css` is the single source of truth; no hardcoded hex in components.

### 3.1 Color roles (verbatim from DESIGN.md)
- `primary: #18241b` (near-black green) — primary CTAs, selected calendar endpoints, active stepper
- `primary-container: #2d3930` (forest green) — "Book Your Stay" nav button, dark press-quote band, booked calendar blocks, admin dark alert card
- `surface/background: #fbf9f9` (warm off-white) — page background
- `surface-container-lowest: #ffffff` — cards
- `surface-container: #efeded` / `surface-container-low: #f5f3f3` — footer band, sidebar active pill, tonal layers
- `on-surface: #1b1c1c` — headings; `on-surface-variant: #434843` — body
- `outline-variant: #c3c8c2` (+ `#E0E0E0` hairlines) — ALL borders/dividers
- Sage accent `primary-fixed-dim: #bccabd` — selected date-range band, calendar hold blocks
- `error: #ba1a1a` on `error-container: #ffdad6` — CANCELLED badges, "Unpaid", Cancel Booking
- Status badge palette (from mockups): CONFIRMED = mint-green bg + dark green text; PENDING = beige-gray bg + gray text; CANCELLED = pale-red bg + red text

### 3.2 Typography (Inter exclusively)
- `display-lg` 72/700/-0.04em (hero); `display-lg-mobile` 40/700/-0.03em
- `headline-md` 32/600/-0.02em; `headline-sm` 24/600/-0.01em
- `body-lg` 18/400/1.6; `body-md` 16/400/1.5
- `label-caps` 12/700/uppercase/0.1em — eyebrows, table headers, field labels, stepper labels
- `mono-data` 14/400 — prices, booking IDs, data values

### 3.3 Shape, elevation, spacing
- Radius: buttons/inputs 4px; cards 0–4px; gallery images 8px; **no mixed system**
- **Zero drop shadows.** Depth = 1px borders + tonal background shifts only. Sticky elements separated by 1px top border.
- Grid: 12-col desktop / 4-col mobile; 8px base unit; container max 1280px; gutter 24px; margins 64px desktop / 20px mobile
- Icons: `@phosphor-icons/react`, strokeWidth 1.5, single family

### 3.4 Signature details (must replicate)
1. Hero headline line 3 ("Natural Serenity.") rendered in faded sage (~50% tone of `#1E3A2C`), not a gradient mask
2. Hero CTA is a **text link with underline + ↓**, not a button
3. Calendar: past dates = diagonal hatched fill; range endpoints = solid `#18241b` with white numerals; in-range nights = sage `#bccabd` band
4. Booking Confirmed check = dark rounded square + white checkmark (NOT green)
5. Footer is text-only: no newsletter, no social icons, no dividers
6. "Discrete Concierge" spelling kept verbatim (as-designed)
7. Trailing periods in "© 2026 LUMASTAY MALAYSIA." / "ARCHITECTURAL PERMANENCE."
8. Admin booking table status pills: uppercase, soft fills as per 3.1

### 3.5 Anti-slop QA lock (impeccable + design-taste-frontend)
- Inter is correct here (explicit brand brief) — taste-skill default override does NOT apply
- One accent color locked across all pages; one radius scale; one theme (light only — dark sections like press-quote band are intentional color blocks within the light theme, allowed once)
- `01 / SPOTLIGHT` numbered eyebrows are intentional art direction (brief wins over taste-skill 9.F)
- No em-dashes in UI copy; separators are `•` or `-`
- No scroll cues beyond the designed "Discover Our Villas ↓" CTA
- Motion: intensity 3 — stepper transitions, `whileInView` reveals, hover states only; `prefers-reduced-motion` collapses everything
- Every CTA: WCAG AA contrast; every form input: label above, error below, AA contrast
- Mobile collapse explicit per section; `min-h-[100dvh]` never `h-screen`

---

## 4. Information Architecture & Routes

### 4.1 Guest-facing
| Route | Surface | Source mockup |
|---|---|---|
| `/` | Frontpage: Hero → TopNavBar → Featured Sanctuary (01/SPOTLIGHT) → The Collection (02/DISCOVER, 3 villa cards) → Curated Experiences (4 amenity cells) → Press quote band → Footer | `frontpage/*` |
| `/villas` | Full Collection (all 4 villas, same card anatomy as frontpage grid) | derived from `frontpage/Main.png` grid |
| `/villas/[slug]` | Property detail: H1 + rating/location meta → 5-image gallery (hero-left 50% + 2×2) → hosted-by + description → amenities 2×3 → specifications table → Location map card → Reviews → Footer. Sticky booking card right | `secondpage/The Pavilion _ RHU RESORT.png` |
| `/book/dates` | Step 1: text-style stepper (DATES active-underlined), custom month calendar, right summary card, `CONTINUE TO GUESTS →` | `Select Date/` |
| `/book/guests` | Step 2: guest count picker (adults/children), same summary card | derived (no mockup — matches stepper + card patterns) |
| `/book/details` | Step 3: primary guest form (name, email, phone) + special requests | derived (fields confirmed by Review page + admin Guest Information) |
| `/book/review` | Step 4: circle-style stepper (✓✓✓ + "4"), Booking Summary + Guest Details cards left, Price card + `CONFIRM BOOKING` + terms right | `review/` |
| `/book/confirmed` | Step 5: monochrome success, booking reference, split detail card, `ADD TO CALENDAR` (.ics) + `RETURN TO DISCOVERY` | `booking-confirmed/` |
| `/bookings/lookup` | Guest booking lookup by reference + email (supports account-less retrieval) | derived |
| `/account` | Optional guest account: booking history (claimed via email match) | derived |
| `/login` | Shared login (admin/staff/guest) — plain Swiss form | derived |

### 4.2 Admin (`/admin`, role-gated ADMIN/STAFF)
| Route | Surface | Source mockup |
|---|---|---|
| `/admin` | Overview: KPI row (Revenue YTD, Occupancy, Total Bookings + dark IMPORTANT TODAY alert card), Booking Activity bar chart, Recent Activity feed | `Overview Dashboard Admin/` |
| `/admin/bookings` | Search + status/property/date filters, bulk-action toolbar, table (BOOKING ID/GUEST/PROPERTY/STAY DATES/AMOUNT/STATUS/⋮), status pills, pagination | `Bookings Dashboard Admin/` |
| `/admin/bookings/[id]` | Detail: header + status badge + actions (Print, Confirm Booking); Guest Information / Property / Stay Details cards; Payment Summary (Unpaid red + Record Payment); Internal Notes; Cancel Booking | `Bookings Info Dashboard Admin/` |
| `/admin/calendar` | Availability Calendar: property filter, Month/Timeline toggle, month nav, legend (AVAILABLE/BOOKED/BLOCKED/PENDING), custom grid with booking bars, Weekly Utilization chart, Quick Actions (Set Maintenance Block, Export PDF Schedule) | `Calander Dashboard Admin/` |
| `/admin/properties` | CRUD list + edit form for 4 villas | derived from admin patterns |
| `/admin/guests` | Guest list + detail (booking history per guest) | derived |
| `/admin/payments` | Payment list, record manual payment, statuses | derived |
| `/admin/reviews` | Review moderation list | derived |
| `/admin/settings` | Property/brand settings, users | derived |
| mobile | Hamburger → drawer SideNavBar (× close, Add New Booking CTA, nav, divider, Settings); mobile dashboard: TODAY'S OVERVIEW eyebrow, REVENUE (MTD) card, BOOKINGS/OCCUPANCY stats, Upcoming Check-ins, Recent Activity timeline | `Mobile Navbar/` |

### 4.3 Admin shell (persistent)
Sidebar ~240px: brand block (`LUMASTAY` / `HOSPITALITY MANAGEMENT`) → black `+ Add New Booking` → nav (Dashboard, Bookings, Calendar, Properties, Guests, Payments, Reviews) with active light-gray pill → divider → Settings (bottom). Topbar: tabs Overview/Analytics/Operations (active underlined) + search + bell + help + avatar. Drawer on mobile.

---

## 5. Functional Requirements

### FR-1 Booking flow
1. Guest picks dates on property page or `/book/dates`; availability enforced (booked/blocked/pending-hold dates unselectable; past dates hatched)
2. Range selection: click check-in → click check-out; nights in between = sage band; min 1 night; no overlap with existing bookings for that property
3. Guests step: adults + children counts, capped by property capacity (e.g., Pavilion: up to 8)
4. Details step: primary guest name, email, phone (+60 format), special requests (optional textarea)
5. Review step: full price breakdown recomputed **server-side** (nightly × nights + cleaning fee + service fee 5% + taxes as configured); terms line verbatim
6. Confirm: creates Booking `PENDING` + reference `#RHU-####` (sequential per property series or global series — global, zero-padded 4+); optional redirect to MockPayment (FPX-style bank picker → success/fail callback); success lands on Confirmed page with .ics download
7. Guest receives booking email (phase 2); check-in instructions email before arrival (phase 2)
8. Guest may optionally create account post-booking; existing bookings auto-claim by verified email match

### FR-2 Availability engine
- Per-property date states: AVAILABLE / BOOKED / BLOCKED (maintenance) / PENDING (hold)
- Blocks created from admin calendar Quick Actions ("Set Maintenance Block")
- Booking confirmation transitions date cells to BOOKED; cancellation releases them
- Availability query is the single guard used by guest date-picker AND admin calendar AND booking creation (server-side re-validation on submit — never trust client)

### FR-3 Admin operations
- Overview KPIs computed from DB: Revenue YTD (paid payments), Occupancy rate (booked nights / available nights, active properties), Total bookings + pending count; "Important Today" = next check-in today
- Bookings table: search (ID/guest/property), filters (status, property, date range), bulk actions (Confirm, Message, Cancel) with selection count, pagination (page size from mockup rhythm, showing "1 to 4 of 128")
- Booking detail: confirm booking, record manual payment (amount, method, note), add internal note (attributed user + date), cancel booking (releases dates), print view
- Calendar: month grid with booking bars (guest name label, truncated), holds (sage), blocks (⊘); export PDF schedule (phase 2 acceptable to stub with print stylesheet)
- Reviews: approve/hide; Reviews shown on property page = approved only

### FR-4 Content & SEO
- Frontpage/property pages fully SSR; `metadataBase`, OG image (static `public/og.png` via sharp — Windows ImageResponse workaround per nextjs-fullstack-setup skill), sitemap.ts (properties from DB with fallback), robots.ts (`disallow: /admin, /api/, /account`)
- Copy verbatim from mockups with brand swap RHU RESORT → LumaStay ("LUMASTAY" wordmark, "© 2026 LUMASTAY MALAYSIA.")

### FR-5 Payments (abstraction)
```ts
interface PaymentProvider {
  createPayment(booking: Booking): Promise<{ redirectUrl: string; reference: string }>;
  handleCallback(payload: unknown): Promise<{ status: 'paid' | 'failed'; reference: string }>;
  verify(reference: string): Promise<'paid' | 'failed' | 'pending'>;
}
```
- `MockPaymentProvider`: internal FPX-style bank-picker page, success/fail buttons, signed callback
- Factory `getPaymentProvider()` via env `PAYMENT_PROVIDER=mock|toyyibpay|billplz`
- Manual admin "Record Payment" bypasses provider (method: bank transfer / cash / other)

---

## 6. Data Model (Prisma 7, PostgreSQL)

Better Auth core models (`User`, `Account`, `Session`, `Verification`) per `nextjs-fullstack-setup` reference schema, with `User.role: String @default("GUEST")` (ADMIN / STAFF / GUEST).

```prisma
model Property {
  id            String   @id @default(cuid())
  slug          String   @unique            // the-pavilion
  name          String                      // The Pavilion at Hulu Langat
  shortName     String                      // The Pavilion (cards/tables)
  locationLine  String                      // Hulu Langat, Selangor, Malaysia
  description   String   @db.Text
  nightlyRate   Decimal  @db.Decimal(10, 2) // RM 3,200.00
  cleaningFee   Decimal  @db.Decimal(10, 2) @default(400)
  serviceFeePct Decimal  @db.Decimal(5, 2)  @default(5.0)
  taxPct        Decimal  @db.Decimal(5, 2)  @default(0)
  maxGuests     Int      @default(8)
  bedrooms      Int
  beds          Int
  baths         Decimal  @db.Decimal(3, 1)  // 4.5
  areaSqft      Int                         // 4500
  architecture  String                      // Modernist Tropical
  materials     String                      // Off-form Concrete, Merbau Timber
  checkInTime   String   @default("3:00 PM")
  checkOutTime  String   @default("12:00 PM")
  amenities     Amenity[]
  images        PropertyImage[]
  specs         PropertySpec[]
  bookings      Booking[]
  blocks        AvailabilityBlock[]
  reviews       Review[]
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Amenity {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  icon       String   // phosphor icon key: "waves", "wifi-high", ...
  label      String   // Infinity Pool
  sortOrder  Int      @default(0)
}

model PropertyImage {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  url        String
  alt        String
  role       String   @default("gallery") // hero | gallery | card | thumb
  sortOrder  Int      @default(0)
}

model PropertySpec {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  label      String   // TOTAL AREA
  value      String   // 4,500 sq ft
  sortOrder  Int      @default(0)
}

model Guest {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String
  userId    String?  @unique            // linked Better Auth user when claimed
  user      User?    @relation(fields: [userId], references: [id])
  bookings  Booking[]
  createdAt DateTime @default(now())
  @@index([email])
}

model Booking {
  id              String        @id @default(cuid())
  reference       String        @unique         // RHU-1042 → LUMA-1042? Keep format "#RHU-1024"-style: prefix "LS-"
  propertyId      String
  property        Property      @relation(fields: [propertyId], references: [id])
  guestId         String
  guest           Guest         @relation(fields: [guestId], references: [id])
  checkIn         DateTime      @db.Date
  checkOut        DateTime      @db.Date
  nights          Int
  adults          Int
  children        Int           @default(0)
  status          BookingStatus @default(PENDING) // PENDING | CONFIRMED | CANCELLED | COMPLETED
  nightlyRate     Decimal       @db.Decimal(10, 2) // snapshot
  cleaningFee     Decimal       @db.Decimal(10, 2) // snapshot
  serviceFee      Decimal       @db.Decimal(10, 2) // snapshot
  taxAmount       Decimal       @db.Decimal(10, 2) @default(0) // snapshot
  totalAmount     Decimal       @db.Decimal(10, 2) // snapshot
  specialRequests String?       @db.Text
  source          String        @default("Direct Website")
  payments        Payment[]
  notes           InternalNote[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  @@index([propertyId, checkIn, checkOut])
  @@index([status])
}

enum BookingStatus { PENDING CONFIRMED CANCELLED COMPLETED }

model AvailabilityBlock {
  id         String     @id @default(cuid())
  propertyId String
  property   Property   @relation(fields: [propertyId], references: [id])
  startDate  DateTime   @db.Date
  endDate    DateTime   @db.Date
  type       BlockType  // BLOCKED (maintenance ⊘) | HOLD (sage)
  label      String?    // "Hold: Corp Retreat"
  createdBy  String?
  createdAt  DateTime   @default(now())
  @@index([propertyId, startDate, endDate])
}

enum BlockType { BLOCKED HOLD }

model Payment {
  id         String        @id @default(cuid())
  bookingId  String
  booking    Booking       @relation(fields: [bookingId], references: [id])
  amount     Decimal       @db.Decimal(10, 2)
  method     String        // mock-fpx | bank-transfer | cash | toyyibpay | billplz
  reference  String?       // provider reference
  status     PaymentStatus @default(PENDING) // PENDING | PAID | FAILED | REFUNDED
  recordedBy String?       // admin user id for manual records
  paidAt     DateTime?
  createdAt  DateTime      @default(now())
  @@index([bookingId])
  @@index([status])
}

enum PaymentStatus { PENDING PAID FAILED REFUNDED }

model Review {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  guestName  String   // James
  rating     Decimal  @db.Decimal(2, 1) // 4.9
  body       String   @db.Text
  stayDate   String?  // September 2024
  approved   Boolean  @default(false)
  createdAt  DateTime @default(now())
  @@index([propertyId, approved])
}

model InternalNote {
  id        String   @id @default(cuid())
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id])
  body      String   @db.Text
  authorId  String
  createdAt DateTime @default(now())
}
```

**Booking reference format:** `LS-1024` style (brand swap from `#RHU-1024`), generated from a Postgres sequence, zero-padded, unique.

**Money rules (per conventions):** all money `@db.Decimal(10, 2)`; totals recomputed server-side; snapshots on Booking (rates may change later); display via `Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' })` helper.

**Availability rule:** a date range is bookable iff no overlapping CONFIRMED/PENDING booking and no overlapping AvailabilityBlock for that property. PENDING bookings older than 24h without payment may be auto-released (phase 2 cron).

---

## 7. Architecture

### 7.1 Stack (locked)
Next.js 16 (App Router, RSC-first, `src/`) · TypeScript strict · Tailwind v4 (vanilla components, `@theme` tokens from DESIGN.md) · `@phosphor-icons/react` · `motion/react` (client leaves only) · PostgreSQL (Supabase pooler) · Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`) · Better Auth 1.6 (`prismaAdapter`, roles) · react-hook-form + zod · TanStack Table (admin bookings) · MapLibre GL (grayscale property map) · Vitest + Playwright · Vercel deploy.

### 7.2 Directory layout
```
src/
  app/
    (guest)/                  # frontpage, villas, book/*, confirmed, lookup, account
    (guest)/page.tsx
    (guest)/villas/page.tsx
    (guest)/villas/[slug]/page.tsx
    (guest)/book/...          # dates | guests | details | review | confirmed
    admin/                    # role-gated
    admin/page.tsx            # overview
    admin/bookings/...
    admin/calendar/page.tsx
    admin/properties|guests|payments|reviews|settings/...
    api/
      auth/[...all]/route.ts  # Better Auth handler
      bookings/route.ts       # create booking (server-side price recompute)
      availability/route.ts   # date-state query
      payments/mock/...       # mock provider pages + callback
    og.png route → static public/og.png (sharp script)
  components/
    ui/                       # vanilla primitives: Button, Badge, Card, Input, Divider, Stepper
    guest/                    # Hero, TopNavBar, VillaCard, AmenityGrid, Gallery, BookingCard,
                              # DatePicker, BookingStepper, SummaryCard, Footer, ReviewCards, MapCard
    admin/                    # SideNav, TopBar, KpiCard, BookingsTable, BookingDetail*,
                              # AvailabilityCalendar, UtilizationChart, ActivityFeed
  lib/
    db.ts  auth.ts  auth-client.ts  guards.ts
    availability.ts           # single availability engine
    pricing.ts                # server-side breakdown recompute
    payments/                 # provider.ts (interface), mock.ts, factory.ts
    booking-reference.ts      # sequence generator
    format.ts                 # MYR, dates
    ics.ts                    # Add to Calendar
    seed-fallback.ts          # static fallback data (build-safe without DB)
  generated/prisma/           # Prisma 7 client (gitignored)
docs/
  specs/2026-08-19-lumastay-design.md   # this file
  superpowers/plans/                    # implementation plans
```

### 7.3 Cross-cutting patterns (from verified conventions)
- **DB fallback:** every server data function try/catch → static seed fallback so `next build`/verify passes with no DB (dev machine has no Postgres)
- **Proxy (not middleware):** `src/proxy.ts` guards `/admin/*` + `/account`; server-side guard re-checked in every mutation handler (two-layer)
- **Booking creation:** client sends only {propertyId, checkIn, checkOut, adults, children, guest fields, specialRequests}; server recomputes availability + pricing; never trust client totals
- **searchParams as Promise** (Next 16); client navigation components receive params via props
- **React Compiler lint:** no setState-in-effect; derive-during-render patterns
- **Seed:** 4 properties (Pavilion, Courtyard House, Limestone Retreat, Horizon Villa) with mockup-verbatim copy, amenities, specs, images; 2 admin users; ~20 sample bookings across statuses; availability blocks; 6 approved reviews. Idempotent (deleteMany in FK order)

---

## 8. Seed Content (verbatim from mockups, brand-swapped)

**Properties:**
1. **The Pavilion at Hulu Langat** — Hulu Langat, Selangor — RM 3,200/night (card shows RM 1,200 "starting from" — use room-type pricing phase 2; v1 nightly = 3,200, card copy adjusted) — 8 guests, 4 bedrooms, 4 beds, 4.5 baths, 4,500 sq ft, Modernist Tropical, Off-form Concrete + Merbau Timber — amenities: Infinity Pool, High-speed Wi-Fi, Chef's Kitchen, Private Parking, Central Air Conditioning, Media Room — rating 4.95 (128 reviews)
2. **Courtyard House** — Janda Baik, Pahang — RM 950+ — 2 Beds, Private Pool
3. **Limestone Retreat** — Tambun, Perak — RM 1,400+ — 4 Beds, Forest View
4. **The Horizon Villa** — Datai Bay, Langkawi — RM 2,100+ — 3 Beds, Ocean Front

**Frontpage copy (verbatim):** "Architectural Permanence. Natural Serenity." / "A curated collection of minimalist sanctuaries designed to elevate your connection to the Malaysian landscape." / "Discover Our Villas ↓" / "Featured Sanctuary" / "01 / SPOTLIGHT" / "The Collection" / "02 / DISCOVER" / "Curated Experiences" / "Every detail engineered for profound relaxation and effortless living." / amenity cells: Private Pools "Architecturally integrated infinity pools in every sanctuary." · Organic Kitchen "Farm-to-table dining experiences prepared by resident chefs." · Discrete Concierge "Anticipatory service ensuring total privacy and convenience." · In-Villa Spa "Therapeutic treatments delivered in the comfort of your retreat." / press quote: "A masterclass in restraint. The architecture doesn't compete with the landscape; it frames it. An incredibly grounding experience that redefines modern luxury." — Monocle Magazine, Travel Issue 2024

**Footer:** `LUMASTAY` · Privacy Policy · Terms of Service · Press Kit · Contact · `© 2026 LUMASTAY MALAYSIA.` `ARCHITECTURAL PERMANENCE.`

**Pavilion description (verbatim):** "Experience unparalleled architectural permanence amidst the ancient rainforests of Hulu Langat. The Pavilion is a masterclass in minimalist design, offering an objective presentation of luxury where structural integrity meets natural serenity. Designed with a disciplined layout, every space directs focus toward the lush surroundings and the essential comforts of a high-end retreat."

**Reviews seed:** James (September 2024) "Immaculate architecture and perfectly maintained. The integration of the living spaces with the jungle outside is seamless. A truly grounding experience." · Sarah (August 2024) "The level of detail in the design is astounding. The kitchen was a joy to use, and the beds were incredibly comfortable. Highly recommend for a quiet retreat."

---

## 9. Non-Functional Requirements

- **a11y:** WCAG AA minimum (4.5:1 body, 3:1 large); focus rings visible; labels above inputs; error text below; stepper keyboard-navigable; calendar grid operable by keyboard (arrow keys) — verify with `design.md lint` + manual audit
- **Performance:** LCP < 2.5s (hero image `priority`); CLS < 0.1 (reserved image boxes); INP < 200ms
- **Responsive:** explicit mobile collapse per section; 4-col mobile grid; admin usable at 390px (drawer nav per mockup)
- **i18n:** English UI (copy as designed); RM/MYR currency throughout; +60 phone format
- **Security:** two-layer admin guards; server-side pricing; Better Auth scrypt credentials; secrets in `.env` (never committed); rate-limit booking creation (phase 2)
- **Testing:** Vitest for pricing/availability/guards/format/booking-reference; Playwright E2E for full booking flow (dates → confirmed) and admin confirm-booking flow; `npm run typecheck && npm test && npm run build` all green per task

---

## 10. Phasing

**Phase 1 (this plan):** Scaffold + design tokens + DB + auth + seed → Guest frontpage, villas index, property detail → availability engine + pricing → 5-step booking flow (mock payment) → admin shell + Overview + Bookings + Booking detail + Calendar → mobile responsive pass → QA (impeccable critique + WCAG + E2E) → Vercel deploy.

**Phase 2 (later):** Email (Resend) + check-in instructions · properties/guests/payments/reviews/settings full CRUD polish · Export PDF schedule · room-type pricing per property · auto-release stale PENDING holds (cron) · ToyyibPay/Billplz real provider · analytics tab.

---

## 11. Open Items Resolved at Planning Time

- Guests/Details step UIs: derived from stepper + Review page fields (no mockups) — must follow same Swiss patterns (label-caps, hairlines, 4px inputs)
- Admin Properties/Guests/Payments/Reviews/Settings pages: extend Bookings table + detail-card patterns
- Login screen: plain Swiss form (no mockup)
- Booking reference prefix: `LS-` (LumaStay), format `LS-1024`
- Pavilion "starting from RM 1,200" vs RM 3,200 nightly: v1 uses single nightly rate RM 3,200 on detail page; frontpage card shows "Starting from RM 3,200 / night" (copy consistency > mockup inconsistency)
