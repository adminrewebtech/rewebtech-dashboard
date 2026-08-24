# RewebTech Dashboard

Internal admin dashboard for [rewebetch.in](https://rewebtech.in).

`/leads` (Lead Generation) talks to the RewebTech API (`api.rewebtech.in`) —
OTP + httpOnly cookie auth, leads, status workflow, contact history, email.
The rest (`/`, `/subscribers`, `/analytics`, `/waitlist`, `/reviews`) still
reads the same MongoDB database as the website repo through its own Prisma
schema, unrelated to the leads API.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, NEXT_PUBLIC_API_URL, ADMIN_*
npm run dev                  # http://localhost:3000 (or PORT=4000 npm run dev)
```

`NEXT_PUBLIC_API_URL` must point at a RewebTech API instance whose
`CORS_ORIGIN` allows this app's origin. Login is email → OTP code, verified
against that API; the session lives in an httpOnly cookie the API sets
(`rwt_session`), not in this app.

## What's here

- `/` — overview KPIs (leads, subscribers, reviews, waitlist, visitors) — local DB
- `/leads` — Lead Generation: stat cards, status tabs, search, cursor pagination,
  detail drawer with status changes, call/email/other logging, email compose —
  all via the RewebTech API
- `/subscribers` — newsletter subscribe/unsubscribe list — local DB
- `/analytics` — visits-per-day chart, top pages, top referrers, recent activity — local DB
- `/waitlist` — launch waitlist signups — local DB
- `/reviews` — verified reviews with a "featured" toggle — local DB

`ADMIN_*` / `npm run seed:admin` are legacy — they seeded the old NextAuth
credentials login, which `/leads` no longer uses. Left in place in case the
other local-DB pages still need an admin gate reintroduced later.

## Notes

- This repo does **not** modify the website's schema — it's a separate
  `schema.prisma` pointed at the same database, with a few additional
  optional fields (`Contact.status`, `Contact.notes`, `Review.featured`)
  that the website simply never sets.
- Deploy as a subdomain of `rewebtech.in` (e.g. `dashboard.rewebtech.in`) —
  the session cookie is `SameSite=Lax` and scoped to `.rewebtech.in`, so a
  cross-domain deploy (e.g. `*.vercel.app`) breaks login.
