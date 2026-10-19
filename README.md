# StoicBare

A bare, focused collection of public-domain quotes from across the ages —
**Stoic sages, Greek philosophers, Eastern masters, Enlightenment thinkers,
Transcendentalists, and modern wits.** No ads, no distractions — just the
words that have shaped human thought across millennia.

> The name is **StoicBare**, but the content is broader than just Stoicism:
> 16 authors spanning 6th c. BC (Lao Tzu, Confucius, Zeno) through early 20th
> c. All quotes are public domain. No data extracted from quotelibrary.org —
> the site's structure (nav, sections, profile layout) inspired StoicBare's
> layout; all copy, quotes, and branding are original StoicBare work.
> The visual identity is original: warm ivory parchment + charcoal text +
> antique-bronze accent + Lora serif headings.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **Fonts**: Inter (body) + Lora (serif headings/quotes), loaded at runtime via
  Google Fonts `<link>` in `layout.tsx` (not `next/font/google`, which broke
  the Turbopack/OpenNext deploy)
- **Content**: 60 public-domain quotes from 16 authors, 12 topics, 6 articles
- **Backend**: Firebase (`firebase@13`) — Firestore + Auth + Analytics.
  Every count (likes, favourites, views) comes from real Firestore data or is
  0 / hidden. No fake numbers anywhere.

## Run

```bash
bun install
bun run dev     # http://localhost:3000
bun run build
bun run start
```

Copy `.env.example` to `.env.local` and fill in the Firebase web config to go live.
Without it, the site runs on the static seed + localStorage likes/favourites.

## Database — Firestore (`stoicbare-86bfa`)

Full schema, rules, and seeding: see **[DATABASE.md](./DATABASE.md)**.

Collections: `authors`, `quotes`, `topics`, `blogs`, `users`, `likes`,
`favorites`, `collections`, `submissions`, `newsletter_subscribers`.

Code: `src/lib/types.ts` (types) · `src/lib/firebase.ts` (client, env-based) ·
`src/lib/db.ts` (typed Firestore CRUD + like/favourite transactions + counters) ·
`src/lib/likes.ts` + `src/lib/favorites.ts` (Firestore with localStorage fallback) ·
`src/lib/auth-context.tsx` (Firebase Auth + `users/{uid}` profile).
`src/lib/prisma.ts` preserves the old Prisma client (currently unused — no file
imports it — kept so the Prisma setup is not lost).

Rules: `firestore.rules` — publish in Firebase console.
Indexes: `firestore.indexes.json` (Firebase CLI format).

Seed (60 quotes, 16 authors, 12 topics, 6 blogs):
```bash
bun run seed                 # regenerates scripts/seed-data.json from src/lib/*
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json bun run seed:firestore
# (service-account key never committed; without it the script prints console-import steps)
```

## Pages

- `/` Home — hero, Quote of the Day, Browse by Author, Featured Quotes, Blog teaser, FAQ teaser, newsletter
- `/quotes` + `/quotes/[id]` — search, filters, pagination, detail, like + save
- `/authors` + `/authors/[id]` — author cards + detail
- `/topics` + `/topics/[slug]` — topic list + detail
- `/blog` + `/blog/[slug]` — original StoicBare essays, like + comments (Firestore when configured)
- `/story` — full-screen quote viewer
- `/about`, `/faq`, `/contribute` — contribute saves to Firestore `submissions` when signed in
- `/login`, `/signup` — Firebase Auth (Google + email), creates `users/{uid}` doc
- `/profile` — real profile, stats (likes / favourites / contributions / comments), favourites, collections, account settings. `/dashboard` redirects to `/profile`.
- `/profile/[uid]` — public profile + public collections

## Deploy

- **Host**: Fly.io via Antideploy. **Antideploy deploys from `main`** — merge
  to `main` to ship.
- **Build**: `npm run build` produces the Next.js standalone output
  (`.next/standalone/`); `npm start` runs
  `node .next/standalone/server.js`.
- **Env vars**: the 7 `NEXT_PUBLIC_FIREBASE_*` values live in
  Antideploy → Settings → Environment Variables. They are baked into the
  bundle at build time — set them **before** triggering a rebuild.
- **Backend config**: deploy Firestore rules/indexes/storage with the
  Firebase CLI from your laptop:
  `firebase deploy --only firestore:rules,firestore:indexes,storage`
  (project `stoicbare-86bfa`).

## Design tokens

- Background: oklch(0.97 0.02 80), Text: oklch(0.2 0.01 50), Primary: oklch(0.5 0.07 65)
- Lora for headings/quotes, Inter for body. No indigo/blue.

## License

MIT. All quotes are public domain (all authors long deceased). Source attributions are noted per quote.
