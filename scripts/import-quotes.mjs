#!/usr/bin/env node

/**
 * Bulk import a reviewed JSONL quote corpus into Firestore.
 *
 * Safe defaults: imported records are pending_review and are not publicly
 * visible until an editor reviews them. Use --publish-reviewed only when the
 * dataset's licensing, attribution, and quote text have already been checked.
 *
 * Example:
 *   node scripts/import-quotes.mjs ./data/quotes.jsonl
 *   node scripts/import-quotes.mjs ./data/quotes.jsonl --publish-reviewed --license CC0-1.0
 *
 * Each JSONL line:
 *   {"text":"...","author":"...","source":"...","sourceUrl":"...","topics":["wisdom"],"license":"CC0-1.0","language":"en"}
 *
 * Auth credentials are supplied via FIREBASE_SERVICE_ACCOUNT_JSON or
 * GOOGLE_APPLICATION_CREDENTIALS. Never commit service-account credentials.
 */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import readline from "node:readline";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const inputPath = args.find((arg) => !arg.startsWith("--"));
const publishReviewed = args.includes("--publish-reviewed");
const licenseFlag = args.indexOf("--license");
const defaultLicense = licenseFlag >= 0 ? args[licenseFlag + 1] || "" : "";

if (!inputPath) {
  console.error(
    "Usage: node scripts/import-quotes.mjs <quotes.jsonl> [--publish-reviewed] [--license <SPDX-or-license-label>]",
  );
  process.exit(2);
}

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let credential = applicationDefault();

if (serviceAccountJson) {
  try {
    credential = cert(JSON.parse(serviceAccountJson));
  } catch (error) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:", error.message);
    process.exit(2);
  }
}

const app = initializeApp({
  credential,
  projectId: process.env.FIREBASE_PROJECT_ID || "stoicbare-86bfa",
});
const db = getFirestore(app);
const quoteCollection = db.collection("quotes");
const chunkSize = 400;

function compactText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeSearch(value).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

function makeSearchTokens(values) {
  const tokens = new Set();
  for (const value of values) {
    for (const word of normalizeSearch(value).split(/\s+/).filter(Boolean)) {
      if (word.length < 2) continue;
      tokens.add(word);
      // Short prefixes support incremental search without a separate search server.
      if (word.length >= 3) {
        const prefixEnd = Math.min(word.length, 12);
        for (let length = 3; length <= prefixEnd; length += 1) {
          tokens.add(word.slice(0, length));
        }
      }
      if (tokens.size >= 180) return [...tokens];
    }
  }
  return [...tokens];
}

function toQuote(line, lineNumber) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    throw new Error("Line " + lineNumber + " is not valid JSON.");
  }
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("Line " + lineNumber + " must be a JSON object.");
  }

  const text = compactText(record.text ?? record.quote);
  const authorName = compactText(record.authorName ?? record.author);
  const source = compactText(record.source ?? record.citation);
  const sourceUrl = compactText(record.sourceUrl ?? record.url);
  const license = compactText(record.license ?? defaultLicense);
  const language = compactText(record.language ?? "en");
  const topics = Array.isArray(record.topics)
    ? [...new Set(record.topics.map((topic) => slugify(topic)).filter(Boolean))].slice(0, 8)
    : [];

  if (text.length < 12 || text.length > 10000) {
    throw new Error("Line " + lineNumber + " has quote text outside the 12–10,000 character range.");
  }
  if (!authorName || authorName.length > 160) {
    throw new Error("Line " + lineNumber + " needs an author between 1 and 160 characters.");
  }
  if (publishReviewed && !license) {
    throw new Error("Line " + lineNumber + " has no license. Add a license field or pass --license.");
  }
  if (source.length > 500 || sourceUrl.length > 2000) {
    throw new Error("Line " + lineNumber + " has a source or source URL that is too long.");
  }

  const authorSlug = slugify(authorName);
  const normalizedText = normalizeSearch(text);
  const contentHash = createHash("sha256")
    .update(authorSlug + "\n" + normalizedText)
    .digest("hex");

  const status = publishReviewed ? "published" : "pending_review";
  const searchTokens = makeSearchTokens([text, authorName, source, ...topics]);

  return {
    id: contentHash,
    data: {
      text,
      authorName,
      authorSlug,
      source,
      sourceUrl,
      topics,
      language,
      license,
      attributionStatus: publishReviewed ? "reviewed" : "needs-review",
      status,
      contentHash,
      normalizedText,
      searchTokens,
      schemaVersion: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: publishReviewed ? FieldValue.serverTimestamp() : null,
    },
  };
}

let readCount = 0;
let validCount = 0;
let importedCount = 0;
let skippedExistingCount = 0;
let duplicateInputCount = 0;
let seenIds = new Set();
let chunk = [];

async function flushChunk() {
  if (!chunk.length) return;

  const uniqueRows = new Map();
  for (const row of chunk) {
    if (seenIds.has(row.id)) {
      duplicateInputCount += 1;
      continue;
    }
    seenIds.add(row.id);
    uniqueRows.set(row.id, row);
  }
  const rows = [...uniqueRows.values()];
  chunk = [];
  if (!rows.length) return;

  const refs = rows.map((row) => quoteCollection.doc(row.id));
  const existingSnapshots = await db.getAll(...refs);
  const batch = db.batch();
  let writes = 0;

  for (let index = 0; index < rows.length; index += 1) {
    if (existingSnapshots[index].exists) {
      skippedExistingCount += 1;
      continue;
    }
    batch.create(refs[index], rows[index].data);
    writes += 1;
  }

  if (writes > 0) {
    await batch.commit();
    importedCount += writes;
  }

  if (readCount % 5000 < chunkSize || readCount === validCount) {
    console.log(
      "Read " + readCount +
      " lines | imported " + importedCount +
      " | already present " + skippedExistingCount +
      " | duplicate input rows " + duplicateInputCount,
    );
  }
}

async function main() {
  const lines = readline.createInterface({
    input: createReadStream(inputPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const rawLine of lines) {
    readCount += 1;
    const line = rawLine.trim();
    if (!line) continue;
    const row = toQuote(line, readCount);
    validCount += 1;
    chunk.push(row);
    if (chunk.length >= chunkSize) await flushChunk();
  }

  await flushChunk();
  console.log("");
  console.log("Import complete.");
  console.log("Project: " + (process.env.FIREBASE_PROJECT_ID || "stoicbare-86bfa"));
  console.log("Valid records: " + validCount);
  console.log("New records: " + importedCount);
  console.log("Existing records skipped: " + skippedExistingCount);
  console.log("Duplicate rows in input skipped: " + duplicateInputCount);
  console.log("Imported status: " + (publishReviewed ? "published" : "pending_review"));
  if (!publishReviewed) {
    console.log("Records are private from the public archive until reviewed and published.");
  }
  await app.delete();
}

main().catch(async (error) => {
  console.error("Import failed:", error?.message || error);
  try {
    await app.delete();
  } catch {
    // Preserve the original import error.
  }
  process.exit(1);
});
