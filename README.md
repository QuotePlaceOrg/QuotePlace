# StoicBare

A bare, focused collection of public-domain quotes from across the ages —
**Stoic sages, Greek philosophers, Eastern masters, Enlightenment thinkers,
Transcendentalists, and modern wits.** No ads, no distractions — just the
words that have shaped human thought across millennia.

> The name is **StoicBare**, but the content is broader than just Stoicism:
> 23 authors spanning 6th c. BC (Lao Tzu, Confucius, Zeno) through early 20th
> c. (Mark Twain, Oscar Wilde, Leo Tolstoy). All quotes are public domain.
> Reverse-engineered from the public landing page at `quotelibrary.org` using
> [`rea-agents`](https://github.com/morluto/rea) (REA — Reverse Engineer
> Anything) and rebuilt on Next.js 16. The source site's *structure* (sticky
> header, hero with quote marks, quote of the day, browse-by-author grid,
> featured-quotes grid, footer with quick links) is reproduced; the source
> site's *content* (modern copyrighted quotes) is not. The visual identity is
> original to StoicBare: warm ivory parchment + charcoal text + antique-bronze
> accent + Lora serif headings.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **Fonts**: Inter (body) + Lora (serif headings/quotes), both via `next/font/google`
- **Content**: 62 public-domain quotes from 23 authors across 2500 years
- **Backend**: Firebase (`firebase@13`) — Analytics wired up; ready to extend to
  Firestore / Auth / Storage

## Page structure

```
<div class="min-h-screen flex flex-col">
  <Header sticky>                     ← logo + nav (Quotes/Authors/Topics/About)
                                          + search + Contribute CTA
  <main>
    {!filtering && (
      <>
        <Hero>                          ← big quote marks + h1 + subtitle + search
        + 21 popular topic pills
        <QuoteOfTheDay>                 ← deterministic per calendar day
        + author + source + topic tags + share buttons
        <BrowseByAuthor>                ← 23 author cards across all traditions
        <FeaturedQuotes>                ← 12 quote cards (sliced from 62)
      </>
    )}
    {filtering && <SearchResults>}      ← when search or author filter is active
  </main>
  <Footer sticky>                       ← brand + Browse/About link columns +
  copyright + live IST clock
</div>
```

## Traditions covered (23 authors)

| Tradition | Authors |
|---|---|
| **Stoic (6)** | Marcus Aurelius, Seneca, Epictetus, Musonius Rufus, Cleanthes, Zeno of Citium |
| **Greek (3)** | Socrates, Plato, Aristotle |
| **Eastern (2)** | Confucius, Lao Tzu |
| **Roman non-Stoic (1)** | Cicero |
| **Renaissance (2)** | Montaigne, Francis Bacon |
| **Enlightenment (3)** | Voltaire, Benjamin Franklin, Immanuel Kant |
| **Transcendentalist (2)** | Ralph Waldo Emerson, Henry David Thoreau |
| **Late 19th c. (2)** | Friedrich Nietzsche, Leo Tolstoy |
| **Modern wits (2)** | Mark Twain, Oscar Wilde |

All 1st c. BC through early 20th c. — every author deceased before 1928,
firmly in the public domain across all jurisdictions.

## Interactions

- **Search** — matches quote text, source, topic, or author name
- **Topic pills** — click to filter (21 topics: wisdom / virtue / discipline /
  resilience / death / anger / time / fate / courage / self-knowledge /
  knowledge / learning / truth / action / freedom / change / nature /
  happiness / hope / purpose / mind)
- **Author click** — filter to that author's quotes (accessible from any
  Browse-by-Author card or any quote card)
- **Clear filter** — resets the search/author filter and returns to the home view
- **Quote of the Day** — rotates daily (deterministic by day-of-year % QUOTES.length)
- **Copy quote** — copies the QoTD text + author attribution to clipboard
- **Share** — surfaces a toast (wire up your preferred share endpoints in
  `src/app/page.tsx`'s `handleShare`)

## Develop

```bash
bun install
bun run dev      # starts on http://localhost:3000
bun run lint     # ESLint
```

## Project layout

```
src/
├── app/
│   ├── globals.css     ← StoicBare theme (ivory + charcoal + bronze, Lora serif)
│   ├── layout.tsx      ← Inter + Lora fonts, metadata, JSON-LD, <FirebaseAnalytics />
│   └── page.tsx        ← the full single-page site + AUTHORS/QUOTES/TOPICS data
├── components/
│   ├── firebase-analytics.tsx   ← client-only mount; inits Analytics post-hydration
│   └── ui/                       ← shadcn/ui primitives (Button, Input, …)
└── lib/
    ├── firebase.ts     ← Firebase App singleton + lazy Analytics init + logEvent
    ├── db.ts           ← Prisma client (available if you add a DB)
    └── utils.ts        ← cn() class helper
```

## Firebase

The Firebase web config (apiKey, appId, measurementId, …) lives in
`src/lib/firebase.ts`. The web SDK is initialized lazily and only on the
client (browser) — `isSupported()` is checked before `getAnalytics(app)`,
so Analytics is gracefully skipped during SSR / in unsupported environments.

To extend to Firestore / Auth / Storage, add the SDKs in `src/lib/firebase.ts`:

```ts
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(firebaseApp);

import { getAuth } from "firebase/auth";
export const auth = getAuth(firebaseApp);

import { getStorage } from "firebase/storage";
export const storage = getStorage(firebaseApp);
```

Then call them from client components (these modules are also browser-only).

## Backend setup (one-time, on your laptop)

StoicBare ships with config files for the Firebase backend (rules, indexes,
storage rules, seed script). To activate the backend in your Firebase
project (`stoicbare-86bfa`), run these commands from your **local laptop**
(not in the sandbox — these need your Google credentials):

### 1. Deploy Firestore rules + indexes + storage rules

```bash
# Install Firebase CLI (one-time)
npm install -g firebase-tools

# Log in with the Google account that owns stoicbare-86bfa
firebase login

# Push the config files to your Firebase project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

What this does:
- **firestore.rules** — security rules go live (public can read published
  quotes/authors/topics/blogs; signed-in users can create pending quotes;
  users own their profile + likes; admin-only for moderation)
- **firestore.indexes.json** — 6 composite indexes created (status+createdAt
  for newest, status+likeCount for trending, status+authorId+createdAt for
  by-author, status+topics+likeCount for by-topic, etc.). These keep
  queries fast at the 100k+ quote target.
- **storage.rules** — rules for blog cover images + user avatar uploads

Verify at https://console.firebase.google.com → stoicbare-86bfa →
Firestore → Rules / Indexes tabs.

### 2. Enable Google sign-in (you've already done this)

Firebase Console → Authentication → Sign-in method → Google → Enable.
Email/password is also enabled if you want that as an alternative.

### 3. Seed the database

Right now your Firestore is empty — the site reads from the hardcoded
`QUOTES` array in `src/app/page.tsx`. "Seeding" means running a one-time
script that takes those 62 quotes + 23 authors and writes them to Firestore.

```bash
# One-time: install firebase-admin (the Node.js Admin SDK)
npm install --save-dev firebase-admin
# or with bun:
bun add -d firebase-admin

# Generate a service account key:
#   Firebase Console → ⚙️ Project Settings → Service Accounts tab →
#   "Generate new private key" → saves a JSON file to your laptop
#   Save it as e.g. ~/.stoicbare-service-account.json
#   ⚠️ Never commit this file — it grants admin access to your Firestore.

# Run the seed
GOOGLE_APPLICATION_CREDENTIALS=~/.stoicbare-service-account.json \
  node scripts/seed-quotes.mjs
# or with bun:
GOOGLE_APPLICATION_CREDENTIALS=~/.stoicbare-service-account.json \
  bun run scripts/seed-quotes.mjs
```

What this does:
- Reads `scripts/seed-data.mjs` (a self-contained snapshot of the 23 authors
  + 62 quotes from `src/app/page.tsx`)
- Writes 23 docs to the `authors` collection (id = author slug, e.g.
  `marcus-aurelius`)
- Writes 62 docs to the `quotes` collection with `status="published"`,
  `contributorId=null`, `likeCount=0`, `createdAt=serverTimestamp()`
- Idempotent: re-running overwrites by doc ID (no duplicates)

Verify at Firebase Console → Firestore → Data tab — you should see
23 author docs + 62 quote docs.

### 4. (Optional) Switch page.tsx to read from Firestore

The demo currently reads from the local `QUOTES` array for instant
first-paint. To switch to Firestore reads:

- In `src/app/page.tsx`, replace `const QUOTES: Quote[] = [...]` with a
  `useEffect` that calls `getPublishedQuotes()` (defined in
  `src/lib/firestore.ts`). Keep the local array as fallback if Firestore
  returns empty.
- For the search at 1k+ quotes scale, switch to Algolia / Typesense —
  Firestore's text search is limited to ~200 docs per query.

### 5. (Optional) Set up an admin claim

To let your user account moderate contributions (publish/reject pending
quotes), set the `admin: true` custom claim via the Firebase Admin SDK:

```bash
# One-time: install the Admin SDK globally or use a small script
node -e "
  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  admin.auth().setCustomUserClaims('YOUR_USER_UID', { admin: true })
    .then(() => { console.log('✅ Admin claim set'); process.exit(0); })
    .catch(e => { console.error('❌', e); process.exit(1); });
"
```

Get your UID from Firebase Console → Authentication → Users → copy the UID.

## License

MIT. All quotes are public domain (1st c. BC through early 20th c., all
authors deceased before 1928). Source attributions are noted per quote.
