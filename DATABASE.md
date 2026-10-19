# StoicBare — Full Database

Firestore (Standard edition) in Firebase project `stoicbare-86bfa`.
All content is original StoicBare copy + short public-domain quotes from long-dead authors.
No data extracted from quotelibrary.org.

## How it works

- The site works **without** Firebase configured: it falls back to the static seed in
  `src/lib/data.ts` + `src/lib/blog-seed.ts`, and likes/favourites fall back to
  `localStorage`. Set the `NEXT_PUBLIC_FIREBASE_*` vars (see `.env.example`) to go live.
- When Firebase is configured + the user is signed in, likes / favourites / profile /
  submissions read + write Firestore. Counters (`likeCount`, `favoriteCount`, …) are
  denormalised on the target doc so lists can sort by them without extra reads.
- One user = one like per target. Like doc id is `${uid}_${targetType}_${targetId}`,
  so a second tap is an unlike (transaction deletes the like + decrements the counter).

## Collections

### `authors/{authorId}`
| field | type | notes |
|---|---|---|
| name, slug | string | slug = URL id, e.g. `marcus-aurelius` |
| epithet, lifespan, bio | string | display copy |
| era, born, died | string \| null | e.g. era `Roman`, born `121` |
| imageUrl | string \| null | author portrait (own / public-domain) |
| quoteCount, likeCount, viewCount | number | denormalised counters, start 0 |
| featured | boolean | show on home |
| status | `published` \| `draft` | only `published` is public |
| searchKeywords | string[] | lowercase tokens for search |
| createdAt, updatedAt | timestamp | |

### `quotes/{quoteId}`
| field | type | notes |
|---|---|---|
| text | string | the quote itself |
| authorId | string | FK → `authors/{authorId}` |
| authorName | string | denormalised for list rendering |
| topics | string[] | topic slugs, e.g. `["wisdom","life"]` |
| source, sourceUrl | string, string \| null | e.g. `Meditations` |
| language | string | `en` for now |
| status | `published` \| `draft` \| `pending` | `pending` = awaiting review |
| likeCount, favoriteCount, viewCount, shareCount, copyCount | number | counters, start 0 |
| featured | boolean | |
| createdBy | string \| null | uid of submitter, null for seed |
| searchKeywords | string[] | |
| createdAt, updatedAt | timestamp | |

Indexes: `authorId + status + createdAt`, `topics array-contains + status + likeCount`,
`status + likeCount`, `status + createdAt`.

### `topics/{slug}`
| field | type | notes |
|---|---|---|
| slug, name, description | string | slug is the doc id |
| quoteCount, likeCount | number | counters |
| imageUrl | string \| null | |
| featured | boolean | |
| createdAt | timestamp | |

### `blogs/{blogId}` — long-form articles (original StoicBare writing)
| field | type | notes |
|---|---|---|
| slug | string | unique URL slug, e.g. `dichotomy-of-control` |
| title, excerpt, content | string | `content` is Markdown |
| coverImageUrl | string \| null | |
| authorId, authorName | string | staff / contributor uid + display name |
| tags, topics | string[] | |
| status | `draft` \| `published` \| `archived` | |
| likeCount, viewCount, commentCount | number | counters |
| readMinutes | number | estimated reading time |
| featured | boolean | |
| seoTitle, seoDescription | string | |
| publishedAt, createdAt, updatedAt | timestamp \| null, timestamp, timestamp | |

Subcollection `blogs/{blogId}/comments/{commentId}`: userId, userName, userPhotoURL,
text, likeCount, status (`published` \| `flagged` \| `hidden`), createdAt.

### `users/{uid}` — one doc per Firebase Auth user, created on first sign-in
| field | type | notes |
|---|---|---|
| displayName, email, photoURL, bio | string | from Auth, editable bio/name |
| role | `reader` \| `contributor` \| `moderator` \| `admin` | default `reader` |
| provider | string | `google`, `password`, … |
| isBanned | boolean | banned users can read, cannot write |
| stats.likesGiven, stats.favoritesCount, stats.contributionsCount, stats.commentsCount | number | counters |
| preferences.newsletter, preferences.theme | boolean, string | |
| createdAt, lastLoginAt | timestamp | |

`users/{uid}/favorites/{quoteId}` is NOT used — favourites live in top-level
`favorites` (easier to query + count). See below.

### `likes/{likeId}` — likeId = `${uid}_${targetType}_${targetId}`
| field | type | notes |
|---|---|---|
| userId, targetType, targetId | string | targetType: `quote` \| `blog` \| `author` \| `comment` |
| createdAt | timestamp | |

Toggle = transaction: if like doc exists → delete + `increment(-1)` on target
counter; else → create + `increment(1)`. Target counter field: `likeCount`.

### `favorites/{favId}` — favId = `${uid}_${quoteId}`
| field | type | notes |
|---|---|---|
| userId, quoteId | string | |
| createdAt | timestamp | |

Toggle mirrors likes, counter field on quote = `favoriteCount`.

### `collections/{collectionId}` — user-curated quote lists
| field | type | notes |
|---|---|---|
| userId, name, description | string | |
| quoteIds | string[] | max 500 |
| isPublic | boolean | public lists get a shareable page later |
| createdAt, updatedAt | timestamp | |

### `submissions/{submissionId}` — Contribute form
| field | type | notes |
|---|---|---|
| type | `quote` \| `correction` \| `blog` | |
| submittedBy, submittedByName | string | uid + display name |
| status | `pending` \| `approved` \| `rejected` | |
| payload | map | e.g. `{ text, authorName, source }` — shape depends on type |
| reviewNote | string \| null | moderator note |
| createdAt, reviewedAt, reviewedBy | timestamp, timestamp \| null, string \| null | |

### `newsletter_subscribers/{id}` — id = base64url(email) or auto-id
| field | type | notes |
|---|---|---|
| email, source, status | string | status: `subscribed` \| `unsubscribed` |
| subscribedAt | timestamp | |

### `counters/{name}` (optional, future)
Global stats (`totalQuotes`, `totalLikes`, …) for the About page. Updated by the same
transactions that update per-doc counters, or by a scheduled job. Not required for v1.

## Security rules — summary (`firestore.rules`)

- Public (no login): read `authors`, `quotes`, `topics`, `blogs` where `status == "published"`,
  plus published blog comments.
- Signed-in, not banned: create/read/delete **own** `likes` + `favorites` (doc id must
  start with own uid), read/update **own** `users/{uid}` doc (cannot change `role` /
  `isBanned`), create `submissions`, create `newsletter_subscribers`, create/update
  **own** `collections`, create **own** blog comments.
- Admin only (custom claim `admin == true` or `users/{uid}.role == "admin"`): write
  `authors` / `quotes` / `topics` / `blogs`, moderate submissions + comments.
- Counters are only changed via `increment()` in the same transaction as the
  like/favourite write — the rules enforce the target doc's other fields are unchanged
  for like/favourite toggles (client uses `updateDoc` with only the counter field).

## Seeding

1. Firebase console → Firestore → create database (Standard edition) if it does not exist.
2. Firebase console → Firestore → Rules → paste `firestore.rules` → Publish.
3. Firebase console → Firestore → Indexes → paste `firestore.indexes.json` (or let the
   console suggest them on first slow query).
4. Seed content (see `scripts/seed-firestore.mjs`):
   ```bash
   # Option A — Admin SDK (needs a service-account key, never commit it)
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/seed-firestore.mjs
   # Option B — Firebase console → Import the generated scripts/seed-data.json
   ```
   The seed contains the 60 quotes + 16 authors + 12 topics from `src/lib/data.ts`
   and the 6 starter blog posts from `src/lib/blog-seed.ts`, all with counters at 0.

## Scaling to 1–2 lakh quotes

- Import in cleaned batches of ≤ 500 writes (Firestore batch limit) — the seed script
  already chunks this way. Add `searchKeywords` at import time, not at query time.
- Paginate lists with `startAfter` cursors, never `offset` on large collections.
- Keep `quotes` list queries on the composite indexes above; do not add per-user
  fields to `quotes` — per-user state lives in `likes` / `favorites`.
