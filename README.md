# RewebTech Dashboard

Internal admin dashboard for [rewebtech.in](https://rewebtech.in).

Saara data [RewebTech API](https://api.rewebtech.in) se aata hai — OTP + httpOnly
cookie auth, leads, aur reviews. **Is app ka apna database connection nahi hai**
aur na koi ORM: har page API call karta hai. Contract `API.md` me hai (API repo).

## Setup

```bash
npm install
npm run dev     # http://localhost:3000
```

Koi env var zaroori nahi. Default me app live API (`https://api.rewebtech.in/api/v1`)
par chalti hai — dekho `lib/apiBase.js`.

## Local development

Data padhne ke liye upar wala setup kaafi hai. Par **login localhost par kaam
nahi karega** jab tak API bhi locally na chale: session cookie `SameSite=Lax` hai
aur `.rewebtech.in` par scoped hai, toh `localhost:3000` se `api.rewebtech.in` ek
cross-site request ban jaati hai aur browser us par cookie bhejta hi nahi.

Poora flow locally chahiye to API apni machine par chalao aur base URL override
karo:

```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1' > .env.local
```

Tab dono `localhost` par hote hain (`:3000` aur `:4000`), woh same-site hain aur
Lax cookie theek chalti hai. API ke `.env` me `CORS_ORIGIN=http://localhost:3000`
rakho aur `COOKIE_DOMAIN` khaali chhod do.

## Pages

- `/` — Overview: leads aur reviews ke counts + recent leads (`GET /overview`)
- `/leads` — Lead Generation: stat cards, status tabs, search, cursor pagination,
  detail drawer, status changes, call/email/other logging, email compose
- `/reviews` — verified reviews aur "featured" toggle (`GET /reviews`,
  `PATCH /reviews/:id/featured`)

## Deploy

**`dashboard.rewebtech.in` par hi deploy karna hai** — yeh choice nahi hai.
Session cookie `SameSite=Lax` hai aur `.rewebtech.in` par set hoti hai, toh kisi
aur domain par (jaise `*.vercel.app`) login kabhi kaam nahi karega. Custom domain
add karne ke baad Vercel/Amplify/kuch bhi chalega — shart domain ki hai, host ki
nahi.

API ke prod `.env` me `CORS_ORIGIN` isi origin par set hona chahiye:
`https://dashboard.rewebtech.in`

Deploy ke liye koi environment variable set karne ki zaroorat nahi.
