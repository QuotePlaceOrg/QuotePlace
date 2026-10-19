# StoicBare ↔ Quote-Library Structure Audit

> Method: this audit compares page/section STRUCTURE only (what sections exist,
> in what order, what a page does) against the public quotelibrary.org homepage
> structure already verified in an earlier session: hero + search, Story View,
> Quote of the Day, Trending/Popular quotes, About (Curated Collection /
> Community Driven / Daily Inspiration), FAQ teaser, Newsletter, Inspirational
> Quotes grid, footer.
>
> Hard boundary honoured: NO text, quote, image, logo, or CSS was copied from
> quotelibrary.org. All copy below is original StoicBare copy; all quotes are
> our existing public-domain seed data. Only the generic structure (a quote
> library has a hero, a quote-of-the-day, trending quotes, author/topic
> browsing, a story view, articles, FAQ, newsletter, footer) was used.

## Current pages (before this rebuild)

Home, Quotes, Quotes/[id], Authors, Authors/[id], Topics, Topics/[slug],
Story, Blog, Blog/[slug], About, FAQ, Contribute, Login, Signup, Dashboard.

## KEEP (has a quote-library counterpart)

- Home hero + search — keep. Matches structure.
- Quote of the Day — keep.
- Story View (`/story`) — keep. It exists in the reference structure.
- Quotes list + detail, Authors list + detail, Topics list + detail — keep,
  but detail pages were thin (see MISSING).
- About (Curated Collection / Community Driven / Daily Inspiration) — keep.
- FAQ teaser on home + `/faq` — keep.
- Newsletter — keep.
- Inspirational / Featured Quotes grid on home — keep, relabelled as
  "Trending Quotes" (sorted by likes) + "Inspirational Quotes" (featured set).
- Blog — keep as Articles. The reference structure invites article
  contributions, so articles belong. Renamed in nav/labels to "Articles";
  `/blog` routes kept working, `/articles` added as the canonical alias.
- Contribute, Login, Signup — keep.

## EXTRA → REMOVED / CONSOLIDATED

| Extra | Action |
|---|---|
| `/dashboard` (thin duplicate of profile: stats + favourites + name form) | Removed as a page. `/dashboard` now redirects to `/profile`, the single canonical profile. All header links updated. |
| Footer live IST clock (ticking date/time in footer) | Removed. No counterpart in a standard quote-library footer; it is noise in a footer and re-renders every 30s. Footer keeps brand blurb, link columns, newsletter link, copyright. |
| FAQ answer saying "An account (coming with the backend) will let you…" | Fixed. Backend exists now; FAQ describes real account behaviour. |
| Home "Browse by Topic" pill row duplicated after the footer-adjacent sections + a second topic filter row on `/quotes` (TopicPills + manual buttons) | Home keeps ONE "Browse by Topic" section in structure order. `/quotes` keeps one topic filter row. Duplicate pill row removed. |
| Blog labelled "Blog" while the library structure calls this section Articles | Relabelled to Articles in nav, headings, footer. Routes aliased, not broken. |

Nothing else was deleted. No page was removed merely for being small; thin
pages were filled in instead (see MISSING).

## MISSING → ADDED

| Missing | Added |
|---|---|
| Full user profile | `/profile` — tabbed: Overview, Favourites, My Collections, My Contributions, Liked, Settings. Public read-only view at `/profile/[uid]`. |
| Collections CRUD | Create / rename / delete collection, add/remove quotes, public toggle. Wired to `db.ts` (Firestore when signed in) with localStorage fallback. New `db.ts` helpers: `updateCollection`, `deleteCollection`, `addQuoteToCollection`, `removeQuoteFromCollection`, `listUserSubmissions`, `listPublicCollectionsByUser`. |
| Contributions with status | `/profile` → My Contributions lists the signed-in user's `submissions` with Pending / Approved / Rejected badges + review note. Guest/empty state included. |
| Quote detail actions | Like + Favourite + Copy + Share + Report/flag placeholder (creates a `correction` submission when signed in, else explains sign-in). Author card + related quotes + same-topic quotes. |
| Author detail depth | Bio, stats (quotes, likes, views), like-author button, full quote list, empty state. |
| Topic detail depth | Description, stats, like-topic button, quote list, empty state. |
| Quotes sorting | Sort control: Newest / Most liked / Most favourited. Search query synced from `?q=` (header search lands here). Pagination kept. |
| Story View depth | Keyboard navigation (←/→), shuffle, like/favourite on the current quote, progress counter. |
| Contact page | `/contact` — Help column in footer links here. Original copy, mailto + form that validates locally (no backend endpoint invented). |
| 404 + loading + empty states | `src/app/not-found.tsx`, `src/app/loading.tsx`, per-route `loading.tsx`, empty states on quotes/authors/topics/articles/profile/collections/contributions. |
| Footer structure | About / Quick links (Quotes, Authors, Topics, Articles, Story) / Help (FAQ, Contribute, Contact) / Newsletter. Original copy. |
| Header/nav parity | Quotes, Authors, Topics, Articles, Story, About + Search + Contribute + Login / Profile avatar. Same items on mobile. |

## No fake numbers (urgent correction applied)

Every count shown in the UI comes from real Firestore data via `db.ts`
(`likeCount`, `favoriteCount`, `viewCount`, `commentCount`, profile `stats`,
collection `quoteIds.length`, submission counts) or is `0` when Firestore has
no value yet. Nothing is hardcoded, randomized, or estimated.

What was removed / fixed under this rule:
- `src/lib/likes.ts`: deleted the localStorage count store (`like-counts`) and
  `getLocalLikeCount`. localStorage now stores only the boolean heart state.
  `toggleLike` returns `{ liked, persisted }`; the displayed count moves only
  when the Firestore transaction actually persisted.
- `QuoteCard`, `BlogCard`, `LikeButton`, `QuoteDetailActions`: counts come
  only from the Firestore-backed `likeCount` prop (or 0). No local merge.
- Home "Trending": was seed-slice order (implied trending with no data).
  Now `listQuotes({ sort: "most-liked" })` from Firestore; with all counts 0
  it honestly shows 0s in seed order.
- `/quotes` sorting (Most liked / Most favourited): was sorted by local
  counts. Now sorted by real Firestore `likeCount` / `favoriteCount` loaded
  via `listQuotes`; before load, seed order (no fake order).
- Quote detail, author detail, topic detail: like counts passed from real
  Firestore docs (`getQuote`, `getAuthorDoc`, `listQuotes`); missing docs → 0.
- Topic page: the Like button was removed entirely — Firestore has no topic
  like target, and the old button wrote to the authors collection under a
  fake `topic-<slug>` id, which would have produced a wrong count.
- No fake users, comments, reviews, testimonials, or audience stats anywhere
  ("10,000+ members", "1.2M quotes", etc. never existed and were not added).
  Real totals are shown: 60 quotes, 16 authors, 12 topics, 6 articles from
  the seed when Firestore is empty.

## Deliberately NOT copied from quotelibrary.org

- No headline, tagline, section copy, FAQ text, footer text, or quote from
  the reference site. Every string in this repo is original StoicBare copy.
- No logo, icon set, image, colour token, font pairing, spacing scale, or
  CSS from the reference site. Branding stays StoicBare: ivory / charcoal /
  bronze, Lora headings + Inter body.
- No quote data from the reference site. Quotes remain our public-domain
  seed (60 quotes, 16 authors) + Firestore seed.
- No pixel-level layout clone. Section order follows the generic structure,
  but composition, cards, and styling are StoicBare's own.
