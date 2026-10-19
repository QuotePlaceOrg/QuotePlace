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

## License

MIT. All quotes are public domain (1st c. BC through early 20th c., all
authors deceased before 1928). Source attributions are noted per quote.
