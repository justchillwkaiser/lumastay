# LumaStay — Foundation Implementation Plan (Plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the LumaStay Next.js 16 project with Prisma 7 + Better Auth + design tokens exported from DESIGN.md, plus a verified seed of all 4 villas and sample data.

**Architecture:** Single Next.js App Router project in `C:\Users\haris\sistem-booking`. Prisma 7 with driver adapter against Supabase Postgres (pooler). Better Auth with role field (ADMIN/STAFF/GUEST). Design tokens generated from `designs/DESIGN.md` into Tailwind v4 `@theme` — single source of truth. Static seed-fallback module keeps `next build` green without DB.

**Tech Stack:** Next.js 16 · TypeScript strict · Tailwind v4 · Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`) · Better Auth 1.6 · Vitest · `@phosphor-icons/react`

**Spec:** `docs/specs/2026-08-19-lumastay-design.md`

## Global Constraints

- Node LTS; npm (not pnpm/yarn)
- Project root: `C:\Users\haris\sistem-booking` (designs/ and docs/ already exist — scaffold with `--force`)
- Prisma 7: `prisma.config.ts` (NOT package.json#prisma); generator `prisma-client` with `output = "../src/generated/prisma"`; datasource url lives in `prisma.config.ts`; driver adapter `@prisma/adapter-pg` + `pg` REQUIRED
- Import Prisma client from `@/generated/prisma/client`, NEVER `@prisma/client`
- `prisma migrate dev` fails non-interactive → use `migrate diff --script` + `migrate deploy` workaround
- Delete agent-skills auto-installed by `prisma init` (`.claude/skills`, `.windsurf/skills`, `.agents/skills`, `skills-lock.json`)
- Better Auth: password hash lives on `Account` (providerId "credential"), NOT `User`; `Verification` model required; `AUTH_SECRET` 32+ chars
- Next 16: `src/proxy.ts` (NOT middleware.ts); page `searchParams` is a Promise (await it)
- Money: `@db.Decimal(10, 2)` always; never Float
- Design tokens: generate from `designs/DESIGN.md` via `npx -y -p @google/design.md designmd export --format css-tailwind` (Windows: use dot-free `designmd` alias); no hardcoded hex in components
- Brand copy: `LUMASTAY` wordmark; `© 2026 LUMASTAY MALAYSIA.` `ARCHITECTURAL PERMANENCE.`
- Verification per task: `npm run typecheck && npm test && npm run build` — all three green
- Dev machine has NO local Postgres: every server data function must try/catch → seed fallback so build passes offline
- Conventional commits (`feat:`, `chore:`, `fix:`)

---

### Task 1: Scaffold Next.js 16 + Tailwind v4 + base deps

**Files:**
- Create: `package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env`, `.env.example`

**Interfaces:**
- Produces: runnable `next dev`/`next build` project; `npm run typecheck` script (`tsc --noEmit`)

- [ ] **Step 1: Scaffold**

```bash
cd C:\Users\haris\sistem-booking
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes --force
```

Expected: existing `designs/` and `docs/` preserved; `src/`, `package.json` created.

- [ ] **Step 2: Install runtime + dev deps**

```bash
npm install prisma @prisma/client @prisma/adapter-pg pg better-auth zod motion react-hook-form @hookform/resolvers @tanstack/react-table @phosphor-icons/react maplibre-gl
npm install -D @types/pg vitest @vitejs/plugin-react @playwright/test tsx sharp
```

- [ ] **Step 3: Add scripts + .env.example + .gitignore entries**

`package.json` scripts must include: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`.

`.env.example`:
```
DATABASE_URL="postgresql://postgres.<ref>:***@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=no-verify"
AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
PAYMENT_PROVIDER="mock"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

`.gitignore` must include: `.env*`, `!.env.example`, `src/generated/`

Generate `AUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` → into `.env`.

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`
Expected: both green on the default scaffold.

- [ ] **Step 5: Commit**

```bash
git init 2>/dev/null; git add -A
git commit -m "chore: scaffold next.js 16 + tailwind v4 + base deps"
```

---

### Task 2: Design tokens from DESIGN.md → Tailwind v4 @theme

**Files:**
- Create: `src/styles/tokens.css`, `scripts/export-tokens.sh`, `tests/tokens.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `designs/DESIGN.md`
- Produces: CSS custom properties `--color-primary`, `--color-surface`, `--color-on-surface`, `--color-outline-variant`, `--font-display-lg` etc. usable as Tailwind classes (`bg-primary`, `text-on-surface`, `border-outline-variant`)

- [x] **Step 1: Write failing test** — `tests/tokens.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("design tokens", () => {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  it("contains brand colors from DESIGN.md", () => {
    expect(css).toContain("#18241b"); // primary
    expect(css).toContain("#2d3930"); // primary-container
    expect(css).toContain("#fbf9f9"); // surface
    expect(css).toContain("#1b1c1c"); // on-surface
    expect(css).toContain("#bccabd"); // sage accent (primary-fixed-dim)
  });
  it("contains Inter typography scale", () => {
    expect(css).toContain("Inter");
    expect(css).toContain("72px"); // display-lg
  });
  it("contains radius + spacing tokens", () => {
    expect(css).toContain("0.25rem"); // radius DEFAULT
    expect(css).toContain("1280px"); // container-max
  });
});
```

- [x] **Step 2: Run test — verify FAIL**

Run: `npm test`
Expected: FAIL (ENOENT `src/styles/tokens.css`)

- [x] **Step 3: Export tokens + wire into globals.css**

```bash
npx -y -p @google/design.md designmd lint designs/DESIGN.md
npx -y -p @google/design.md designmd export --format css-tailwind designs/DESIGN.md > src/styles/tokens.css
```

Review lint output: fix any WCAG `contrast-ratio` ERRORS by adjusting only `on-*` token pairings (document any change in the commit message). Warnings acceptable.

`src/app/globals.css` first line: `@import "tailwindcss";` then `@import "../styles/tokens.css";`

If the exporter output is missing the typography scale (fontSize tokens), append a manual `@theme` block to `tokens.css` replicating DESIGN.md typography verbatim (display-lg 72px/700/-0.04em, headline-md 32px/600/-0.02em, headline-sm 24px/600/-0.01em, body-lg 18px, body-md 16px, label-caps 12px/700/0.1em, mono-data 14px).

- [x] **Step 4: Run test — verify PASS**

Run: `npm test`
Expected: PASS (3 tests)

- [x] **Step 5: Commit**

```bash
git add src/styles src/app/globals.css tests scripts
git commit -m "feat: export DESIGN.md tokens to tailwind v4 theme"
```

---

### Task 3: Prisma 7 schema + config + client ✅

**Files:**
- Create: `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/db.ts`, `tests/db.test.ts`

**Interfaces:**
- Produces: `import { db } from "@/lib/db"` — a PrismaClient singleton typed from generated client; models: User, Account, Session, Verification, Property, Amenity, PropertyImage, PropertySpec, Guest, Booking, AvailabilityBlock, Payment, Review, InternalNote (+ enums BookingStatus, BlockType, PaymentStatus)

- [ ] **Step 1: Write failing test**

`tests/db.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("prisma client", () => {
  it("exports a db singleton with all models", async () => {
    const { db } = await import("@/lib/db");
    for (const m of ["property", "booking", "guest", "payment", "review",
      "availabilityBlock", "internalNote", "amenity", "propertyImage",
      "propertySpec", "user", "account", "session", "verification"] as const) {
      expect(db[m as keyof typeof db], m).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npm test`
Expected: FAIL (module `@/lib/db` not found)

- [x] **Step 3: Init Prisma 7 + write schema**

```bash
npx prisma init
rm -rf .claude/skills .windsurf/skills .agents/skills skills-lock.json
```

`prisma/schema.prisma`: generator `prisma-client` with `output = "../src/generated/prisma"`; datasource WITHOUT url. Models exactly per spec Section 6 (Better Auth User/Account/Session/Verification per `nextjs-fullstack-setup` reference: Account has accountId, providerId, accessToken?, refreshToken?, idToken?, accessTokenExpiresAt?, refreshTokenExpiresAt?, scope?, password?, createdAt, updatedAt + `@@unique([providerId, accountId])`; User has `role String @default("GUEST")`; every relation two-sided).

`prisma.config.ts`:
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env.DATABASE_URL ?? "" },
  migrations: { seed: "npx tsx prisma/seed.ts" },
});
```

`src/lib/db.ts`:
```ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [x] **Step 4: Generate client + migrate (if DB reachable)**

```bash
npx prisma generate
# only if DATABASE_URL is live:
mkdir -p prisma/migrations/0_init
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
npx prisma migrate deploy
```

If DB unreachable (no Supabase project yet): generate client only; record `DB PENDING` in commit message; migrations run in Task 6 verification when credentials exist.

- [x] **Step 5: Run test — verify PASS**

Run: `npm test && npm run typecheck`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add prisma src/lib/db.ts src/generated tests
git commit -m "feat: prisma 7 schema (14 models) + db singleton"
```

---

### Task 4: Better Auth config + guards + proxy

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/guards.ts`, `src/app/api/auth/[...all]/route.ts`, `src/proxy.ts`, `tests/guards.test.ts`

**Interfaces:**
- Produces: `auth` (server), `authClient` (browser), `requireUser()`, `requireAdmin()` guards; proxy protecting `/admin/*` and `/account`

- [ ] **Step 1: Write failing test**

`tests/guards.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); },
}));

describe("guards", () => {
  it("requireAdmin redirects guests to /login", async () => {
    getSession.mockResolvedValue(null);
    const { requireAdmin } = await import("@/lib/guards");
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });
  it("requireAdmin rejects non-admin roles", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "GUEST" } });
    const { requireAdmin } = await import("@/lib/guards");
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });
  it("requireAdmin returns session for ADMIN", async () => {
    const session = { user: { id: "a1", role: "ADMIN" } };
    getSession.mockResolvedValue(session);
    const { requireAdmin } = await import("@/lib/guards");
    await expect(requireAdmin()).resolves.toEqual(session);
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npm test`
Expected: FAIL (`@/lib/guards` not found)

- [ ] **Step 3: Implement auth stack**

`src/lib/auth.ts`:
```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: { additionalFields: { role: { type: "string", defaultValue: "GUEST" } } },
});
```

`src/app/api/auth/[...all]/route.ts`:
```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
export const { GET, POST } = toNextJsHandler(auth);
```

`src/lib/auth-client.ts`:
```ts
"use client";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
```

`src/lib/guards.ts`:
```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || (role !== "ADMIN" && role !== "STAFF")) redirect("/login");
  return session;
}
```

`src/proxy.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const session = getSessionCookie(request);
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account"] };
```

- [ ] **Step 4: Run test — verify PASS**

Run: `npm test && npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib src/app/api src/proxy.ts tests
git commit -m "feat: better auth + role guards + proxy"
```

---

### Task 5: Seed data + fallback module

**Files:**
- Create: `prisma/seed.ts`, `src/lib/seed-fallback.ts`, `tests/seed-fallback.test.ts`

**Interfaces:**
- Produces: `fallbackProperties: PropertyCardData[]` and `getPropertyBySlugFallback(slug)` used by guest pages when DB is offline; `prisma/seed.ts` idempotent seed (4 properties, 2 admin users, 20 bookings, blocks, 6 reviews)

- [ ] **Step 1: Write failing test**

`tests/seed-fallback.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { fallbackProperties, getPropertyBySlugFallback } from "@/lib/seed-fallback";

describe("seed fallback", () => {
  it("has all 4 villas in mockup order", () => {
    expect(fallbackProperties.map(p => p.slug)).toEqual([
      "the-pavilion", "courtyard-house", "limestone-retreat", "the-horizon-villa",
    ]);
  });
  it("pavilion matches mockup facts", () => {
    const p = getPropertyBySlugFallback("the-pavilion")!;
    expect(p.name).toBe("The Pavilion at Hulu Langat");
    expect(p.nightlyRate).toBe("3200.00");
    expect(p.maxGuests).toBe(8);
    expect(p.baths).toBe("4.5");
    expect(p.areaSqft).toBe(4500);
    expect(p.amenities).toHaveLength(6);
    expect(p.locationLine).toContain("Hulu Langat");
  });
  it("returns undefined for unknown slug", () => {
    expect(getPropertyBySlugFallback("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: Implement fallback + seed**

`src/lib/seed-fallback.ts`: export types `PropertyCardData` (slug, name, shortName, locationLine, nightlyRate string, maxGuests, bedrooms, beds, baths, areaSqft, architecture, materials, description, amenities `{icon,label}[]`, specs `{label,value}[]`, cardImage, heroImage, rating, reviewCount) and data for all 4 villas with copy VERBATIM from spec Section 8 (Pavilion description, amenity labels "Infinity Pool / High-speed Wi-Fi / Chef's Kitchen / Private Parking / Central Air Conditioning / Media Room", specs "TOTAL AREA 4,500 sq ft / ARCHITECTURE Modernist Tropical / MATERIALS Off-form Concrete, Merbau Timber"). Images: `https://picsum.photos/seed/lumastay-<slug>-<n>/1600/1200` placeholders (documented as placeholders pending real photography).

`prisma/seed.ts`: idempotent — deleteMany in FK order (InternalNote → Payment → Review → AvailabilityBlock → Booking → PropertySpec → PropertyImage → Amenity → Property → Guest → Session → Account → Verification → User), then insert: 4 properties (same data as fallback), admin user `admin@lumastay.my` / password `lumastay-admin-2026` (hash via `hashPassword` from `better-auth/crypto`, stored on Account providerId "credential"), staff user, 3 guests, 20 bookings spread across statuses/dates (2 checking in today for the IMPORTANT TODAY card: Ahmad Aiman at The Pavilion, 2 Guests, 3:00 PM), 2 availability blocks (Smith Family BOOKED-equivalent booking Aug 3-4; "Hold: Corp Retreat" HOLD Aug 6-7; one BLOCKED Aug 2), payments matching bookings, 6 approved reviews (James/Sarah verbatim + 4 more), internal note on BK-1042 ("Guest requested extra pillows and a late check-out if possible. Housekeeping notified." by Sarah L.).

- [ ] **Step 4: Run test + typecheck — verify PASS**

Run: `npm test && npm run typecheck`
Expected: PASS. If DB live: `npx prisma db seed` and confirm row counts via `npx prisma studio` or a quick `pg` script.

- [ ] **Step 5: Commit**

```bash
git add prisma src/lib tests
git commit -m "feat: seed data (4 villas, bookings, reviews) + offline fallback"
```

---

### Task 6: Vanilla UI primitives + fonts + root layout

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Divider.tsx`, `src/components/ui/LabelCaps.tsx`, `tests/ui-primitives.test.tsx`
- Modify: `src/app/layout.tsx`, `next.config.ts`

**Interfaces:**
- Produces: `<Button variant="primary|ghost" >` (primary: bg-primary text-on-primary radius 4px; ghost: 1px outline), `<Badge tone="confirmed|pending|cancelled">`, `<Card>` (1px outline-variant border, no shadow, radius 4px), `<Input label error>` (label above, error below), `<Divider>` (1px #E0E0E0), `<LabelCaps>` (12px/700/uppercase/0.1em)

- [ ] **Step 1: Write failing test**

`tests/ui-primitives.test.tsx` (vitest + @testing-library/react):
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

describe("ui primitives", () => {
  it("primary button has brand classes", () => {
    render(<Button>RESERVE NOW</Button>);
    const b = screen.getByRole("button", { name: "RESERVE NOW" });
    expect(b.className).toContain("bg-primary");
    expect(b.className).toContain("text-on-primary");
    expect(b.className).toContain("rounded"); // 4px
  });
  it("ghost button has outline, no fill", () => {
    render(<Button variant="ghost">View Full Collection</Button>);
    const b = screen.getByRole("button");
    expect(b.className).toContain("border");
    expect(b.className).not.toContain("bg-primary");
  });
  it("badge tones map to status colors", () => {
    render(<Badge tone="confirmed">CONFIRMED</Badge>);
    expect(screen.getByText("CONFIRMED").className).toContain("uppercase");
  });
});
```

(Install `npm install -D @testing-library/react @testing-library/jest-dom jsdom`; add `vitest.config.ts` with jsdom environment + `@/` alias.)

- [ ] **Step 2: Run test — verify FAIL**

Run: `npm test`
Expected: FAIL (components not found)

- [ ] **Step 3: Implement primitives + layout**

Rules (from spec 3.1–3.4): no shadows anywhere; radius 4px on buttons/inputs, 0–4px cards; 1px `outline-variant` borders; button text AA contrast; Input = label-caps above, 1px boxed frame, error text below in `error` token; Badge = soft fill per tone (confirmed: mint `#d8e6d9` bg + `#2d3930` text; pending: `#e2e3e1` bg + `#434843` text; cancelled: `#ffdad6` bg + `#ba1a1a` text); Button `:active` = `translate-y-[1px]`.

`src/app/layout.tsx`: Inter via `next/font/google` (subsets latin, variable `--font-inter`, display swap); `metadata` with `metadataBase` from `NEXT_PUBLIC_SITE_URL ?? VERCEL_PROJECT_PRODUCTION_URL ?? http://localhost:3000`, title template `%s | LumaStay`, description from spec; `robots.ts` + `sitemap.ts` created (robots disallows `/admin`, `/api/`, `/account`).

`next.config.ts`: `images.remotePatterns` for `picsum.photos` (placeholder photography).

- [ ] **Step 4: Run test — verify PASS**

Run: `npm test && npm run typecheck && npm run build`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src tests vitest.config.ts next.config.ts package.json
git commit -m "feat: vanilla ui primitives (swiss) + inter + root layout"
```

---

## Self-Review

**Spec coverage (Plan 1):** §3 tokens (Task 2) · §6 data model (Task 3) · §7.1 stack (Task 1) · §7.3 auth/proxy/fallback patterns (Tasks 4, 5) · §8 seed content (Task 5) · §9 testing baseline (all tasks). UI primitives (Task 6) serve §3.4 component rules. Guest pages → Plan 2; booking engine + admin → Plan 3; deploy → end of Plan 3.

**Placeholder scan:** none — all steps carry exact code/commands.

**Type consistency:** `db` singleton name consistent; `requireAdmin`/`requireUser` names match across test + impl; `fallbackProperties`/`getPropertyBySlugFallback` consistent; booking reference prefix `LS-` deferred to Plan 3 (`lib/booking-reference.ts`) — noted in spec §6.

**Known deferrals:** Supabase credentials needed for Task 3 Step 4 + Task 5 seed verification (user provides before execution or steps run in DB-pending mode); real villa photography (picsum placeholders flagged in code comments).
