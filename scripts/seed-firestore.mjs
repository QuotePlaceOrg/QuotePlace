// Seed Firestore for StoicBare — run once after creating the DB in Firebase console.
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/seed-firestore.mjs
// The service-account key must NEVER be committed. Without it, this script prints
// instructions and exits — use Firebase console import of seed-data.json instead.
//
// What it writes (idempotent — setDoc with fixed ids, safe to re-run):
//   authors/{id}  topics/{slug}  quotes/{id}  blogs/{id}
// All counters start at 0. No user data is seeded.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(readFileSync(join(dir, "seed-data.json"), "utf8"));

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("No GOOGLE_APPLICATION_CREDENTIALS set.");
    console.log("Option A: download a service-account key in Firebase console (Project settings → Service accounts), then:");
    console.log("  GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/seed-firestore.mjs");
    console.log("Option B: Firebase console → Firestore → Import seed-data.json (or add the docs manually).");
    console.log(`Seed file ready: ${join(dir, "seed-data.json")} — ${seed.quotes.length} quotes, ${seed.authors.length} authors, ${seed.topics.length} topics, ${seed.blogs.length} blogs.`);
    return;
  }
  const { initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
  initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) });
  const db = getFirestore();
  const stamp = FieldValue.serverTimestamp();

  for (const [collection, docs] of Object.entries({ authors: seed.authors, topics: seed.topics, quotes: seed.quotes, blogs: seed.blogs })) {
    for (const batch of chunk(docs, 450)) {
      const wb = db.batch();
      for (const d of batch) {
        const { id, ...rest } = d;
        const data = { ...rest, createdAt: stamp, updatedAt: stamp };
        if (collection === "blogs") data.publishedAt = d.publishedAt ? new Date(d.publishedAt) : null;
        wb.set(db.collection(collection).doc(id), data, { merge: true });
      }
      await wb.commit();
    }
    console.log(`✓ ${collection}: ${docs.length} docs`);
  }
  console.log("Seed complete. Publish firestore.rules in Firebase console before going live.");
}

main().catch((e) => { console.error(e); process.exit(1); });
