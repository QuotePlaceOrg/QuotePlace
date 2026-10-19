/**
 * StoicBare — Firestore schema + helpers.
 *
 * Designed for 100k+ quotes scale (the long-term target).
 *
 * Collections:
 *
 *   quotes/{quoteId}                  Quote documents (auto-id)
 *     - text: string                  The quote text (the body)
 *     - authorId: string              Reference to authors/{authorId}
 *     - source: string                Citation, e.g. "Meditations, Book IV"
 *     - topics: string[]              Topic tags for filtering
 *     - likeCount: number             Denormalized counter (atomic increment)
 *     - contributorId: string?       users/{uid} who submitted; null for seed
 *     - status: "published" | "pending" | "rejected"
 *     - createdAt: Timestamp
 *     - slug: string                  SEO slug (auto-generated from text)
 *
 *   authors/{authorId}                Author documents (slug id)
 *     - name, epithet, lifespan, bio, quoteCount (denormalized), slug
 *
 *   topics/{topicId}                  Topic documents (slug id)
 *     - name, slug, quoteCount (denormalized)
 *
 *   users/{uid}                       User profile (keyed by Firebase Auth UID)
 *     - displayName, email, photoURL, bio
 *     - joinedAt: Timestamp
 *     - contributionCount, likeCount  (denormalized)
 *
 *   users/{uid}/likes/{quoteId}      Like records (subcollection)
 *     - likedAt: Timestamp
 *     Each like is a doc with the same ID as the liked quote, so toggling is
 *     a simple set/delete on a known path.
 *
 *   blogs/{blogId}                    Blog posts (auto-id)
 *     - title, slug, excerpt, bodyMarkdown, coverImageURL
 *     - tags: string[]
 *     - authorId: string              users/{uid}
 *     - publishedAt: Timestamp
 *     - status: "published" | "draft"
 *     - viewCount: number
 *
 * Composite indexes (deploy with `firebase deploy --only firestore:indexes`):
 *   - quotes: status (ASC) + createdAt (DESC)              — newest published
 *   - quotes: status (ASC) + likeCount (DESC)              — trending
 *   - quotes: status (ASC) + authorId (ASC) + createdAt (DESC)  — by author
 *   - quotes: status (ASC) + topics (array-contains) + likeCount (DESC) — by topic
 *   - blogs: status (ASC) + publishedAt (DESC)             — newest blogs
 *
 * Security rules (deploy with `firebase deploy --only firestore:rules`):
 *   - quotes: read if status == "published"; create if signed in (set status
 *     to "pending" — server-side rules can enforce this); update/delete: admin only
 *   - authors, topics, blogs: read published; write: admin only
 *   - users/{uid}: read if request.auth.uid == uid; create if signed in;
 *     update if request.auth.uid == uid
 *   - users/{uid}/likes: read/write if request.auth.uid == uid
 *     (the likeCount increment on the quote doc is done via server-side
 *     Cloud Functions or controlled by the client with security rules that
 *     verify the user owns the like doc)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type QuoteStatus = "published" | "pending" | "rejected";

export interface QuoteDoc {
  id: string;
  text: string;
  authorId: string;
  source: string;
  topics: string[];
  likeCount: number;
  contributorId: string | null;
  status: QuoteStatus;
  createdAt: Timestamp | null;
  slug: string;
}

export interface AuthorDoc {
  id: string;
  name: string;
  epithet: string;
  lifespan: string;
  bio: string;
  quoteCount: number;
  slug: string;
}

export interface BlogDoc {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  coverImageURL: string;
  tags: string[];
  authorId: string;
  authorName: string;
  publishedAt: Timestamp | null;
  viewCount: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

const quoteFromSnap = (
  snap: QueryDocumentSnapshot<DocumentData> | DocumentData,
): QuoteDoc => {
  const data = "data" in snap ? snap.data() : snap;
  return {
    id: "id" in snap ? snap.id : (data.id as string),
    text: data.text ?? "",
    authorId: data.authorId ?? "",
    source: data.source ?? "",
    topics: data.topics ?? [],
    likeCount: data.likeCount ?? 0,
    contributorId: data.contributorId ?? null,
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? null,
    slug: data.slug ?? "",
  };
};

const authorFromSnap = (
  snap: QueryDocumentSnapshot<DocumentData>,
): AuthorDoc => {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name ?? "",
    epithet: data.epithet ?? "",
    lifespan: data.lifespan ?? "",
    bio: data.bio ?? "",
    quoteCount: data.quoteCount ?? 0,
    slug: data.slug ?? snap.id,
  };
};

const blogFromSnap = (
  snap: QueryDocumentSnapshot<DocumentData>,
): BlogDoc => {
  const data = snap.data();
  return {
    id: snap.id,
    title: data.title ?? "",
    slug: data.slug ?? snap.id,
    excerpt: data.excerpt ?? "",
    bodyMarkdown: data.bodyMarkdown ?? "",
    coverImageURL: data.coverImageURL ?? "",
    tags: data.tags ?? [],
    authorId: data.authorId ?? "",
    authorName: data.authorName ?? "",
    publishedAt: data.publishedAt ?? null,
    viewCount: data.viewCount ?? 0,
  };
};

/**
 * Generate a URL-safe slug from text. Lowercase, ASCII, hyphen-separated,
 * trimmed to 60 chars. Used for both quotes and blog posts.
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // strip HTML-like tags
      .replace(/<[^>]+>/g, "")
      // remove punctuation except hyphens
      .replace(/[^\w\s-]/g, "")
      // collapse whitespace
      .replace(/\s+/g, "-")
      // collapse hyphens
      .replace(/-+/g, "-")
      .slice(0, 60)
      .replace(/^-|-$/g, "")
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Reads — Quotes
// ───────────────────────────────────────────────────────────────────────────

/**
 * Fetch a page of published quotes, newest first.
 * Use `startAfter` with the last doc's createdAt for pagination.
 * Requires composite index: status (ASC) + createdAt (DESC).
 */
export async function getPublishedQuotes(
  count: number = 12,
  cursor?: Timestamp | null,
): Promise<QuoteDoc[]> {
  let q;
  if (cursor) {
    q = query(
      collection(firestore, "quotes"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(count),
    );
  } else {
    q = query(
      collection(firestore, "quotes"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(count),
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(quoteFromSnap);
}

/**
 * Fetch trending (most-liked) published quotes.
 * Requires composite index: status (ASC) + likeCount (DESC).
 */
export async function getTrendingQuotes(
  count: number = 5,
): Promise<QuoteDoc[]> {
  const q = query(
    collection(firestore, "quotes"),
    where("status", "==", "published"),
    orderBy("likeCount", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(quoteFromSnap);
}

/**
 * Fetch quotes by a specific author.
 * Requires composite index: status (ASC) + authorId (ASC) + createdAt (DESC).
 */
export async function getQuotesByAuthor(
  authorId: string,
  count: number = 50,
): Promise<QuoteDoc[]> {
  const q = query(
    collection(firestore, "quotes"),
    where("status", "==", "published"),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(quoteFromSnap);
}

/**
 * Fetch quotes by topic (array-contains query).
 * Requires composite index: status (ASC) + topics (array-contains) + likeCount (DESC).
 */
export async function getQuotesByTopic(
  topic: string,
  count: number = 50,
): Promise<QuoteDoc[]> {
  const q = query(
    collection(firestore, "quotes"),
    where("status", "==", "published"),
    where("topics", "array-contains", topic),
    orderBy("likeCount", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(quoteFromSnap);
}

/**
 * Basic client-side text search across a small fetched pool. For 100k+
 * quotes scale, replace this with Algolia / Typesense / Vertex AI Search.
 */
export async function searchPublishedQuotes(
  searchTerm: string,
  count: number = 50,
): Promise<QuoteDoc[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return [];
  const pool = await getPublishedQuotes(200);
  return pool
    .filter(
      (q) =>
        q.text.toLowerCase().includes(term) ||
        q.source.toLowerCase().includes(term) ||
        q.topics.some((t) => t.toLowerCase().includes(term)),
    )
    .slice(0, count);
}

// ───────────────────────────────────────────────────────────────────────────
// Reads — Authors, Topics, Blogs
// ───────────────────────────────────────────────────────────────────────────

export async function getAuthorById(
  authorId: string,
): Promise<AuthorDoc | null> {
  const snap = await getDoc(doc(firestore, "authors", authorId));
  if (!snap.exists()) return null;
  return authorFromSnap(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function getAllAuthors(): Promise<AuthorDoc[]> {
  const snap = await getDocs(collection(firestore, "authors"));
  return snap.docs.map(authorFromSnap);
}

export async function getPublishedBlogs(
  count: number = 6,
): Promise<BlogDoc[]> {
  const q = query(
    collection(firestore, "blogs"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map(blogFromSnap);
}

// ───────────────────────────────────────────────────────────────────────────
// Writes — Contribute a quote
// ───────────────────────────────────────────────────────────────────────────

export interface ContributionInput {
  text: string;
  authorId: string;
  source: string;
  topics: string[];
  contributorId: string;
}

/**
 * Submit a new quote contribution. Writes to the `quotes` collection with
 * status="pending" — moderator approval is required before it shows up in
 * the public feed (status is filtered to "published" by the read helpers).
 */
export async function submitContribution(
  input: ContributionInput,
): Promise<string> {
  const ref = doc(collection(firestore, "quotes"));
  const data = {
    text: input.text.trim(),
    authorId: input.authorId,
    source: input.source.trim(),
    topics: input.topics.map((t) => t.trim().toLowerCase()).filter(Boolean),
    likeCount: 0,
    contributorId: input.contributorId,
    status: "pending" as QuoteStatus,
    createdAt: serverTimestamp(),
    slug: slugify(input.text),
  };
  await setDoc(ref, data);
  return ref.id;
}

// ───────────────────────────────────────────────────────────────────────────
// Writes — Likes (atomic toggle + per-user record)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Toggle a like for the given user on the given quote. Idempotent: if the
 * user already liked this quote, the like doc is deleted and the quote's
 * likeCount is decremented; otherwise the like doc is created and the
 * likeCount is incremented.
 *
 * For 100k+ quotes scale, you may want to move the increment to a Cloud
 * Function that runs after the like doc write — but for the demo, this
 * client-side approach is fine with proper security rules.
 */
export async function toggleLike(
  quoteId: string,
  userId: string,
  isCurrentlyLiked: boolean,
): Promise<void> {
  const likeRef = doc(firestore, "users", userId, "likes", quoteId);
  const quoteRef = doc(firestore, "quotes", quoteId);

  if (isCurrentlyLiked) {
    // Unlike
    await deleteDoc(likeRef);
    await updateDoc(quoteRef, { likeCount: increment(-1) });
  } else {
    // Like
    await setDoc(likeRef, { likedAt: serverTimestamp() }, { merge: true });
    await updateDoc(quoteRef, { likeCount: increment(1) });
  }
}

/**
 * Fetch all quote IDs a user has liked. Used to populate heart states and
 * the "My Likes" view.
 */
export async function getUserLikedQuoteIds(
  userId: string,
): Promise<string[]> {
  const snap = await getDocs(collection(firestore, "users", userId, "likes"));
  return snap.docs.map((d) => d.id);
}

/**
 * Create or update a user profile doc after sign-in. Idempotent: if the doc
 * exists, only the displayName/photoURL are refreshed.
 */
export async function upsertUserDoc(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}): Promise<void> {
  const ref = doc(firestore, "users", user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    // refresh display info only
    await updateDoc(ref, {
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
    });
    return;
  }
  await setDoc(ref, {
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    bio: "",
    joinedAt: serverTimestamp(),
    contributionCount: 0,
    likeCount: 0,
  });
}
