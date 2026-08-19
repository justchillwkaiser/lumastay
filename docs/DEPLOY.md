# LumaStay — Deployment Notes

## Stack

Next.js 16 · Prisma 7 (Postgres) · Better Auth · Vercel (region `sin1`).

## Environment Variables (`.env.example`)

| Var | Notes |
|-----|-------|
| `DATABASE_URL` | **Use the Supabase pooler URL** — `postgresql://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=no-verify`. Direct connections (`db.<ref>.supabase.co:5432`) are IPv6-only on Supabase and **fail from Vercel** (IPv4 egress). The pooler port 6543 is IPv4-reachable. |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://<project>.vercel.app` in production |
| `PAYMENT_PROVIDER` | `mock` (phase 1); `toyyibpay`/`billplz` later |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL for metadata/sitemap |

## First Deploy

```bash
vercel link
vercel env add DATABASE_URL   # paste pooler URL
vercel env add AUTH_SECRET
vercel env add BETTER_AUTH_URL
vercel --prod
```

## Database Setup

```bash
# Apply migrations (sequence + guest email unique) against the pooler URL
DATABASE_URL="..." npx prisma migrate deploy

# Seed properties + admin/staff users (admin@lumastay.my / lumastay-admin-2026)
DATABASE_URL="..." npx tsx prisma/seed.ts
```

## Pitfalls (verified)

- **IPv6 pitfall:** direct Supabase host is IPv6-only — always use the pooler.
- **`prisma generate`** runs via postinstall/build (`next build` needs the
  generated client at `src/generated/prisma`).
- **Playwright artifacts** (`test-results/`, `playwright-report/`) are
  git-ignored.
- Admin routes are guarded twice: `src/proxy.ts` matcher + `requireAdmin()`
  in `src/app/admin/layout.tsx`. `/login` must exist for the redirect.
