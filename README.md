# Quote Place

A collection of public-domain quotes of every genre — **wisdom, life, love,
success, poetry, grief, courage** — set as images you can send, post, or
keep. No ads, no distractions, no watermarks — just the best lines ever
written, with real attribution.

> The name is **Quote Place**. The content spans all genres: 16 authors from
> 6th c. BC (Lao Tzu, Confucius, Zeno) through early 20th c. All quotes are
> public domain. No data extracted from quotelibrary.org — the site's
> structure (nav, sections, profile layout) inspired Quote Place's layout;
> all copy, quotes, and branding are original Quote Place work.
> The visual identity is original: parchment + ink + deep teal + copper accent +
> Playfair Display (logo) + Fraunces / Newsreader / IBM Plex Mono type.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **Fonts**: Playfair Display (logo) + Fraunces (display) + Newsreader (body) + IBM Plex Mono (labels),
  loaded at runtime via Google Fonts `<link>` in `layout.tsx` (not
  `next/font/google`, which broke the Turbopack/OpenNext deploy)
- **Content**: 60 public-domain quotes from 16 authors, 12 topics
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

- `/` Home — hero, Quote of the Day, Featured Quotes, FAQ teaser
- `/quotes` + `/quotes/[id]` — search, filters, pagination, detail, like + save
- `/topics` + `/topics/[slug]` — topic list + detail
- `/about`, `/faq`
- `/login`, `/signup` — Firebase Auth (Google + email), creates `users/{uid}` doc
- `/profile` — real profile, stats (likes / favourites / contributions / comments), favourites, collections, account settings. `/dashboard` redirects to `/profile`.
- `/profile/[uid]` — public profile + public collections

## Deploy

- **Host**: Vercel. Import the repo in Vercel; Vercel auto-deploys on
  push to `main`.
- **Env vars**: set all 7 `NEXT_PUBLIC_FIREBASE_*` values in Vercel →
  Project Settings → Environment Variables. They do NOT carry over from
  Antideploy — they must be re-added in Vercel. They are baked into the
  bundle at build time — set them **before** triggering a rebuild.
- **Backend config**: deploy Firestore rules/indexes/storage with the
  Firebase CLI from your laptop:
  `firebase deploy --only firestore:rules,firestore:indexes,storage`
  (project `stoicbare-86bfa`).

## Design tokens

- Background: #F2EAD9 (Parchment), Text: #1A1815 (Ink), Primary: #0F3D3E (Deep teal), Accent: #B87333 (Copper), Hairline: #D8CBB0, Faded: #6B6459
- Playfair Display for the logo, Fraunces for display, Newsreader for body, IBM Plex Mono for labels. Flat colors only — no gradients, no shadows, no glow.

## License

MIT. All quotes are public domain (all authors long deceased). Source attributions are noted per quote.
