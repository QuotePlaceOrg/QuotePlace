# StoicBare Firestore and contributions

This setup adds a Firestore-backed public quote archive, Firebase email/password
and Google sign-in, a private contributor submission queue, and an editor review
page. It is designed for a corpus of 100,000+ quote documents without downloading
the whole collection into the browser.

## 1. Enable Firebase products

The web app is configured for the existing Firebase project
`stoicbare-86bfa` in `src/lib/firebase.ts`.

In the Firebase console:

1. Open **Authentication → Sign-in method** and enable **Email/Password**.
2. Optionally enable **Google** sign-in and add the production domain under
   Authentication → Settings → Authorized domains.
3. Open **Firestore Database** and create the database if one does not exist.
   Use production mode; the committed rules are the intended access policy.
4. Confirm your deployment account has permission to deploy Firestore rules and
   indexes to this project.

The web Firebase config (including `apiKey`) identifies the project; it is not
an admin credential. Access is enforced by Authentication and the Firestore
rules. Do not put service-account JSON, private keys, or admin SDK credentials
in the repository or client bundle.

## 2. Install dependencies and deploy the rules

From the repository root:

```bash
bun install
npx firebase-tools login
npx firebase-tools use stoicbare-86bfa
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

The project alias is in `.firebaserc`. If the Firebase CLI asks for project
confirmation, verify that `stoicbare-86bfa` is the intended project before
deploying. These rule and index files live in the repository; they do not affect
the live database until deployment succeeds.

## 3. Collections and document model

- `quotes/{sha256}`: canonical quote content. A stable ID is derived from the
  normalized author and text to reduce duplicate imports. Fields include
  `text`, `authorName`, `authorSlug`, `source`, `sourceUrl`, `topics`,
  `language`, `license`, `attributionStatus`, `status`, `searchTokens`,
  `normalizedText`, `contentHash`, `createdAt`, `updatedAt`, and
  `publishedAt`. Only `status: "published"` is public.
- `quoteSubmissions/{autoId}`: submissions from authenticated contributors.
  Each record is private to its author and admins and starts with
  `status: "pending"`. Contributors cannot publish or edit canonical quotes.
- `users/{uid}`: optional public profile fields. A client cannot assign itself
  an admin role.
- `users/{uid}/favorites/{quoteId}`: a per-user place to store saved quotes.
- `authors/{authorSlug}` and `topics/{topicSlug}`: optional curated metadata.

The browser requests 12 published quotes per page with Firestore cursor
pagination. Filtering by author/topic and token search uses the supplied
composite indexes. Search uses a word/prefix index: a large-scale, typo-tolerant
full-text experience should use a dedicated search product (for example,
Algolia) connected to the canonical Firestore collection.

The existing 25 home-page examples are local presentation data; they are not
automatically copied into Firestore. The live archive becomes populated after a
dataset is imported.

## 4. Bulk import 100,000+ quotes

Use a JSONL file (one JSON object per line) prepared from a dataset that you are
entitled to store and publish. Each record can include:

```json
{"text":"The quote text.","author":"Author Name","source":"Book or collection","sourceUrl":"https://example.org/source","topics":["wisdom","courage"],"language":"en","license":"CC0-1.0"}
```

Do not load an undocumented scrape or a dataset whose licensing and attribution
requirements are unclear. The importer defaults to `pending_review`, which
keeps new records out of the public archive:

```bash
node scripts/import-quotes.mjs ./data/quotes.jsonl
```

For a dataset you have already checked for attribution and publication rights,
set a fallback license label and explicitly confirm review:

```bash
node scripts/import-quotes.mjs ./data/quotes.jsonl --publish-reviewed --license CC0-1.0
```

If the input provides a `license` on every record, the fallback `--license`
argument can still be used as a dataset-wide default. The importer uses stable
hash IDs, checks for existing documents, skips duplicates, and writes in batches
below Firestore's 500-write limit. It can be re-run to resume after an interrupted
import without duplicating prior records.

Authenticate the Admin SDK using a trusted service account. Either set
`GOOGLE_APPLICATION_CREDENTIALS` to a local, untracked credential file, or set
`FIREBASE_SERVICE_ACCOUNT_JSON` to the service-account JSON in your local
environment. Never place either credential in a committed `.env` file. You can
also set `FIREBASE_PROJECT_ID`; it defaults to `stoicbare-86bfa`.

For 100,000 documents, the import performs document-existence reads plus writes.
Check Firebase billing and quotas before importing at scale.

## 5. Editor review

The contribution button prompts a signed-out visitor to sign in or create an
account. Email/password is required for the default route; Google login is
available only if you enabled that provider. Authenticated users can submit a
quote, author, optional source, and up to five topics. Submissions are not public
until approved. The review queue at `/admin` also includes bulk-imported `quotes`
whose status is `pending_review`, so imported records can be reviewed and published
without exposing them publicly first.

To grant your own account reviewer access:

1. In Firebase Authentication, find the trusted editor's user ID (UID).
2. Authenticate the Admin SDK locally as described above.
3. Grant the custom claim:

   ```bash
   node scripts/set-admin-claim.mjs <firebase-auth-uid>
   ```

4. Sign out and back in (or refresh the ID token), then open `/admin`.

To revoke the claim, run:

```bash
node scripts/set-admin-claim.mjs <firebase-auth-uid> --revoke
```

The script preserves any other custom claims. Never grant this claim to a user
based solely on a self-reported email address. Approving a submission requires
a reviewer to enter a rights basis/license and confirm that the quotation,
attribution, source, and publication rights were checked. Approval writes a
canonical `quotes` record and marks the submission as approved in one batch.

## 6. Security notes

- The committed rules allow public reads only for published quotes; clients
  cannot write to `quotes`.
- Users can create pending submissions only under their own UID and can read
  only their own submissions. Reviewers are authorized by a Firebase Auth
  `admin: true` custom claim.
- Rules are defense-in-depth, but they do not implement sophisticated abuse
  rate limits. Before opening contributions widely, enable Firebase App Check
  and consider server-side rate limiting or moderation signals.
- The browser's public quote search is keyword/prefix matching, not a general
  natural-language search engine.
- Firestore can store well over 100,000 small quote documents, but capacity is
  not the same as a fixed price. Costs depend on reads, writes, indexes, traffic,
  storage, and the selected Firebase plan.
