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
│   ├── layout.tsx      ← Inter + Lora fonts, metadata, JSON-LD
│   └── page.tsx        ← the full single-page site
└── components/ui/      ← shadcn/ui primitives (Button, Input, …)
```

## License

MIT. All quotes are public domain (ancient Greek and Roman texts, 1st–2nd
century BC/AD). Source attributions are noted per quote.
