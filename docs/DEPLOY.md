# LumaStay — Deployment Notes

## Stack

Next.js 16 · Prisma 7 (Postgres — **Neon**) · Better Auth · Vercel (region `sin1`).

## Environment Variables (`.env.example`)

| Var | Notes |
|-----|-------|
| `DATABASE_URL` | **Neon pooler URL** — `postgresql://<user>:<pass>@<host>-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`. Neon pooler is IPv4-reachable (Vercel-compatible). |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://<project>.vercel.app` in production |
| `PAYMENT_PROVIDER` | `mock` (phase 1); `toyyibpay`/`billplz` later |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL for metadata/sitemap |

## First Deploy

```bash
vercel link
vercel env add DATABASE_URL   # paste Neon pooler URL
vercel env add AUTH_SECRET
vercel env add BETTER_AUTH_URL
vercel --prod
```

## Database Setup

```bash
# Apply migrations (sequence + guest email unique + no_overlapping_bookings)
DATABASE_URL="..." npx prisma migrate deploy

# Seed properties + admin/staff users
DATABASE_URL="..." npx tsx prisma/seed.ts
```

**Seeded accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@lumastay.my` | `lumastay-admin-2026` |
| Staff | `staff@lumastay.my` | `lumastay-staff-2026` |

## Pitfalls (verified)

- **Neon SSL warning** — `pg` v8 treats `sslmode=require` as `verify-full`; safe to ignore for now (will be standard in pg v9).
- **`prisma generate`** runs via postinstall/build (`next build` needs the generated client at `src/generated/prisma`).
- **Playwright artifacts** (`test-results/`, `playwright-report/`) are git-ignored.
- Admin routes are guarded twice: `src/proxy.ts` matcher + `requireAdmin()` in `src/app/admin/layout.tsx`. `/login` must exist for the redirect.
