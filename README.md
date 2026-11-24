# منيو — White-label QR Menu & Ordering Platform

A multi-tenant digital menu and online-ordering platform for restaurants. One
deployment serves any number of restaurants, each with its own branding, menu,
prices, WhatsApp number and admin login — no code changes needed per restaurant.

**Sample tenant:** [Tabboush (تبّوش)](#) — a demo grill restaurant in Shibin El
Qanater, Qalyubia. **All data in the demo is fictional** (dishes, prices, photos,
WhatsApp number), labeled as demo on every page.

## Features

### Customer side — `/r/<slug>`
- 📱 Mobile-first QR menu in Arabic (RTL), per-restaurant theme colors, logo and info
- 🛒 Cart with quantities, order type (pickup / delivery / table) and notes
- 👤 Customer accounts (email + password, JWT) — order history per restaurant at "طلباتي"
- 💬 Every order can also be sent as a formatted WhatsApp message via a `wa.me` link (no paid API)
- 🔍 SEO basics: meta description, Open Graph, Restaurant JSON-LD, `sitemap.xml`, `robots.txt`

### Restaurant side — `/admin`
- Owner logs in with restaurant slug + admin code (bcrypt-hashed)
- **الطلبات**: live order list with customer name, phone, items, totals and status workflow (جديد → قيد التحضير → جاهز → تم التسليم / ملغي)
- **المنيو**: full menu editor — add/remove categories and items, edit names, descriptions, prices, photos, badges
- **الإعدادات**: restaurant name, tagline, area, WhatsApp number, logo URL, and 3 theme colors — applied instantly to the public menu

## Onboard a new restaurant in minutes

1. Clone the repo, set env vars (see below), deploy to Vercel.
2. Create the tenant:
   ```bash
   MONGODB_URI=... node server/onboard.js --slug my-place --name "مطعمي" \
     --code <owner-admin-code> --whatsapp 201XXXXXXXXX \
     --tagline "..." --area "..." --primary "#0ea5e9" --dark "#0369a1" --light "#e0f2fe"
   ```
3. Share two links with the owner: menu at `/r/my-place`, admin at `/admin`.
4. Owner edits everything else (menu, photos, colors) from the panel. Print a QR code pointing at the menu URL.

## Tech

- **Frontend**: React 18 + Vite, plain CSS, Arabic RTL (Cairo font)
- **Backend**: serverless functions (`/api`) — Node, Mongoose, JWT, bcryptjs
- **Database**: MongoDB (free Atlas M0 cluster works)
- **Local dev**: Vite dev server proxies `/api` to `server/dev.js` (Express wrapper around the same serverless handlers); `mongodb-memory-server` runs tests without a database install

### Env vars

| Var | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string (Atlas free tier fine) |
| `JWT_SECRET` | Long random string for session tokens |
| `STAFF_CODE` | Legacy/unused in v2 — admins use per-restaurant codes |
| `SEED_KEY` | One-shot bootstrap: `POST /api/seed` with header `x-seed-key` seeds the Tabboush sample tenant, only when the DB is empty |

### Scripts

```bash
npm install
npm run dev          # frontend on :5173
npm run dev:api      # API on :5000 (needs MONGODB_URI + JWT_SECRET)
node server/seed.js  # seed/refresh the Tabboush sample tenant
node test/e2e.mjs    # full API test suite on in-memory MongoDB (17 checks)
npm run build        # static frontend to dist/
```

## Security notes

- Passwords and admin codes are bcrypt-hashed; sessions are JWTs (customer tokens and admin tokens are separate scopes and can't cross)
- Order prices are recomputed server-side from the stored menu — the client never sets prices
- The public tenant endpoint never exposes the admin code hash
- All sample data is fictional and labeled as demo (ribbon on every page, checkout note, footer)

## WhatsApp Business API — later upgrade

The demo sends orders through a `wa.me` deep link, which needs no approval or
paid API. The official **WhatsApp Business Platform (Cloud API)** would enable
automatic order confirmations and status notifications, but it requires a Meta
Business account, business verification and template approval — documented as a
later upgrade, not part of this demo.

## Photos

All food photos are from [Unsplash](https://unsplash.com) (hotlinked). A real
deployment should host the restaurant's own photos.

## التخزين

البيانات محفوظة في MongoDB Atlas (خطة مجانية M0) — تعديلات لوحة التحكم تُحفظ بشكل دائم.

بالنسبة للنشر على Vercel لازم تضيف `MONGODB_URI` و `JWT_SECRET` و `SEED_KEY` كـ Secrets في إعدادات المشروع قبل أول Seed.
