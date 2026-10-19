# StoicBare

A bare, focused collection of public-domain Stoic quotes from Marcus Aurelius,
Seneca, Epictetus, Musonius Rufus, Cleanthes, and Zeno of Citium. No ads, no
distractions — just the words that have shaped human thought for two thousand
years.

> Reverse-engineered from the public landing page at `quotelibrary.org` using
> [`rea-agents`](https://github.com/morluto/rea) (REA — Reverse Engineer
> Anything) and rebuilt as **StoicBare** on Next.js 16. The source site's
> *structure* (sticky header, hero with quote marks, quote of the day,
> browse-by-author grid, featured-quotes grid, footer with quick links) is
> reproduced; the source site's *content* (modern quotes from living/mid-century
> authors) is not — StoicBare only carries public-domain Stoic texts. The
> visual identity is original to StoicBare: warm ivory parchment + charcoal
> text + antique-bronze accent + Lora serif headings.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **Fonts**: Inter (body) + Lora (serif headings/quotes), both via `next/font/google`
- **Content**: 25 public-domain Stoic quotes from 6 authors (ancient Greek/Roman texts)
- **Backend**: Firebase Authentication + Firestore + Analytics
- **Community**: Email/password and optional Google sign-in; submissions are private until editorial approval
- **Scale**: Firestore-backed quote archive with cursor pagination, search tokens, and a bulk importer for 100,000+ records

## Page structure

```
<div class="min-h-screen flex flex-col">
  <Header sticky>                     ← logo + nav (Quotes/Authors/Topics/About)
                                          + search + Contribute CTA
  <main>
    {!filtering && (
      <>
        <Hero>                          ← big quote marks + h1 + subtitle + search
        + popular topic pills (wisdom / virtue / discipline / …)
        <QuoteOfTheDay>                 ← deterministic per calendar day
        + author + source + topic tags + share buttons (Twitter / Facebook /
        LinkedIn / Copy)
        <BrowseByAuthor>                ← 6 author cards (Marcus / Seneca / Epictetus
        / Musonius / Cleanthes / Zeno) with avatar + lifespan + bio + quote count
        <FeaturedQuotes>                ← 9 quote cards
      </>
    )}
    {filtering && <SearchResults>}      ← when search or author filter is active
  </main>
  <Footer sticky>                       ← brand + Browse/About link columns +
  copyright + live IST clock
</div>
```

## Interactions

- **Search** — matches quote text, source, topic, or author name
- **Topic pills** — click to filter (`wisdom`, `virtue`, `discipline`,
  `resilience`, `death`, `anger`, `time`, `fate`, `courage`, `self-knowledge`)
- **Author click** — filter to that author's quotes (also accessible from the
  Browse-by-Author grid)
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
│   └── page.tsx        ← the full single-page site
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
so Analytics is gracefully skipped during SSR / in unsupported environments
(private browsing with cookies disabled, etc.).

The Firebase web config is **designed to be public** — security for your
project is enforced by Firebase Security Rules, not by hiding this config.
You can see it shipping on https://stoicbare.app once deployed.

The client singleton already exports `auth` and `db` for Firebase Authentication and Firestore. To add Firebase Storage later, export a Storage instance from `src/lib/firebase.ts`:

```ts
import { getStorage } from "firebase/storage";
export const storage = getStorage(firebaseApp);
```

Use Firebase Auth and Firestore from client components, and keep Admin SDK operations in trusted scripts or server-only code.


## Firebase quote archive and contributions

The Contribute button opens sign-in/create-account first, then a quote submission
form. Submissions are stored privately in `quoteSubmissions` with a pending
status. Trusted editors can review the queue at `/admin`; a quote is added to
the public `quotes` collection only after its attribution and rights basis are
confirmed. Client-side rules prevent contributors from publishing or editing
canonical quotes directly.

The live quote archive uses cursor-based pagination and does not download the
entire database. The bulk importer accepts JSONL files with deterministic hash
IDs, duplicate skipping, per-document metadata, and Firestore batches.

Read **[docs/firestore-setup.md](docs/firestore-setup.md)** for Firebase Console
configuration, security rule deployment, admin access, and importing a large
licensed dataset. The repository is configured for project `stoicbare-86bfa`,
but rules/indexes must be deployed and the quote corpus must be imported before
the live archive shows its database records.

## License

MIT. All quotes are public domain (ancient Greek and Roman texts, 1st–2nd
century BC/AD). Source attributions are noted per quote.
