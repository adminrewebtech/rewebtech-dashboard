# RewebTech Dashboard

Internal admin dashboard for [rewebetch.in](https://rewebtech.in). Reads and manages
the same MongoDB database as the website repo (leads, subscribers, visitor
analytics, launch waitlist, reviews) through its own Prisma schema.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, NEXTAUTH_SECRET, ADMIN_*
npm run seed:admin           # creates/updates the first admin login
npm run dev                  # http://localhost:3000 (or PORT=4000 npm run dev)
```

`NEXTAUTH_SECRET` — generate with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## What's here

- `/` — overview KPIs (leads, subscribers, reviews, waitlist, visitors)
- `/leads` — Contact form submissions, searchable/filterable, status tracking (new/contacted/won/lost), internal notes
- `/subscribers` — newsletter subscribe/unsubscribe list
- `/analytics` — visits-per-day chart, top pages, top referrers, recent activity (from Visitor/VisitEvent)
- `/waitlist` — launch waitlist signups
- `/reviews` — verified reviews with a "featured" toggle for surfacing on the website later

Auth is email/password via NextAuth credentials + a Mongo-backed `AdminUser`
model — there's no public signup, admins are created with `npm run seed:admin`.

## Notes

- This repo does **not** modify the website's schema — it's a separate
  `schema.prisma` pointed at the same database, with a few additional
  optional fields (`Contact.status`, `Contact.notes`, `Review.featured`)
  that the website simply never sets.
- Deploy separately from the main site (e.g. a different Vercel project on
  `admin.rewebtech.in`), pointed at the same `DATABASE_URL`.
