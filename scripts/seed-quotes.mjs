/**
 * StoicBare — Firestore seed script.
 *
 * One-time script that populates your Firestore `quotes` + `authors`
 * collections with the 62 public-domain Stoic/Greek/Eastern/Enlightenment
 * quotes currently hardcoded in src/app/page.tsx.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW TO RUN (on your local laptop, not in the sandbox)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. Install firebase-admin (one-time):
 *
 *      npm install --save-dev firebase-admin
 *      # or, if you use bun:
 *      bun add -d firebase-admin
 *
 * 2. Generate a service account key:
 *    - Go to Firebase Console → https://console.firebase.google.com
 *    - Select project: stoicbare-86bfa
 *    - ⚙️ Project Settings → Service Accounts tab
 *    - Click "Generate new private key" → saves a JSON file to your laptop
 *    - Save it somewhere safe, e.g. ~/.stoicbare-service-account.json
 *    - ⚠️ Never commit this file to git — it grants admin access to your
 *      Firestore. (It's already in .gitignore if you want to keep it in
 *      the project folder as `service-account.json`.)
 *
 * 3. Deploy Firestore rules + indexes first (so the security model is in
 *    place before you write data — although the Admin SDK bypasses rules
 *    anyway, this is good hygiene):
 *
 *      firebase deploy --only firestore:rules,firestore:indexes,storage
 *
 * 4. Run the seed:
 *
 *      GOOGLE_APPLICATION_CREDENTIALS=~/.stoicbare-service-account.json \
 *        node scripts/seed-quotes.mjs
 *
 *    Or with bun:
 *
 *      GOOGLE_APPLICATION_CREDENTIALS=~/.stoicbare-service-account.json \
 *        bun run scripts/seed-quotes.mjs
 *
 * 5. Verify in Firebase Console → Firestore → Data tab:
 *    - authors collection: 23 docs
 *    - quotes collection: 62 docs (status="published")
 *
 * Re-running is safe — the script uses doc IDs based on author slug + quote
 * slug, so duplicate runs overwrite instead of duplicating.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AFTER SEEDING — switch page.tsx to read from Firestore (optional)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * The demo currently reads from the local QUOTES array for instant
 * first-paint. To switch to Firestore reads:
 *
 *   - In src/app/page.tsx, replace `const QUOTES: Quote[] = [...]` with
 *     a fetch from getPublishedQuotes() (defined in src/lib/firestore.ts).
 *   - Keep the local array as a fallback (useEffect + useState pattern)
 *     so the page still renders if Firestore is unreachable.
 *
 * Once you have 1000+ quotes in Firestore, switch the search to
 * Algolia / Typesense — Firestore's text search is limited to ~200 docs
 * per query without a dedicated search index.
 */

import admin from "firebase-admin";
import { authors as AUTHORS, quotes as QUOTES } from "./seed-data.mjs";

// ─────────────────────────────────────────────────────────────────────────
// Init Admin SDK
// ─────────────────────────────────────────────────────────────────────────

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "❌ GOOGLE_APPLICATION_CREDENTIALS env var is not set.\n" +
      "   Generate a service account key from Firebase Console →\n" +
      "   Project Settings → Service Accounts → Generate new private key,\n" +
      "   then run:\n" +
      "   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/seed-quotes.mjs",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ─────────────────────────────────────────────────────────────────────────
// Slugify (matches src/lib/firestore.ts slugify)
// ─────────────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

// ─────────────────────────────────────────────────────────────────────────
// Seed authors
// ─────────────────────────────────────────────────────────────────────────

async function seedAuthors() {
  console.log(`\n📝 Seeding ${AUTHORS.length} authors…`);
  let count = 0;
  const batches = [];
  let batch = db.batch();
  let batchCount = 0;

  for (const author of AUTHORS) {
    const ref = db.collection("authors").doc(author.id);
    batch.set(ref, {
      name: author.name,
      epithet: author.epithet,
      lifespan: author.lifespan,
      bio: author.bio,
      slug: author.id,
      quoteCount: QUOTES.filter((q) => q.authorId === author.id).length,
    });
    batchCount++;
    count++;
    if (batchCount >= 400) {
      // Firestore batch limit is 500 ops
      batches.push(batch.commit());
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) batches.push(batch.commit());

  await Promise.all(batches);
  console.log(`   ✓ Wrote ${count} author docs`);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────
// Seed quotes
// ─────────────────────────────────────────────────────────────────────────

async function seedQuotes() {
  console.log(`\n📚 Seeding ${QUOTES.length} quotes…`);
  let count = 0;
  const batches = [];
  let batch = db.batch();
  let batchCount = 0;

  for (const quote of QUOTES) {
    // Use a deterministic ID: <authorId>-<slug-of-text>
    const slug = slugify(quote.text).slice(0, 40);
    const docId = `${quote.authorId}-${slug}`;
    const ref = db.collection("quotes").doc(docId);
    batch.set(ref, {
      text: quote.text,
      authorId: quote.authorId,
      source: quote.source,
      topics: quote.topics,
      likeCount: 0,
      contributorId: null,
      status: "published",
      createdAt: FieldValue.serverTimestamp(),
      slug,
    });
    batchCount++;
    count++;
    if (batchCount >= 400) {
      batches.push(batch.commit());
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) batches.push(batch.commit());

  await Promise.all(batches);
  console.log(`   ✓ Wrote ${count} quote docs (status="published")`);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 StoicBare — Firestore seed starting…");
  console.log(
    `   Project: ${admin.app().options.projectId ?? "stoicbare-86bfa"}`,
  );

  const authorCount = await seedAuthors();
  const quoteCount = await seedQuotes();

  console.log("\n✅ Seed complete.");
  console.log(`   ${authorCount} authors + ${quoteCount} quotes written.`);
  console.log("   Verify at https://console.firebase.google.com →");
  console.log("   stoicbare-86bfa → Firestore → Data tab.");

  await admin.app().delete();
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
