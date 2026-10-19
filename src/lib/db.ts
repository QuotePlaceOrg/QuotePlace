// Quote Place — typed Firestore data layer.
// Every read falls back to the static seed (src/lib/data.ts / blog-seed.ts) when
// Firebase is not configured or the read fails, so the site never breaks.
// Writes require Firebase + a signed-in user and throw otherwise — callers
// catch that and fall back to localStorage (see likes.ts / favorites.ts).
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  setDoc,
  updateDoc,
  runTransaction,
  increment,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";
import type {
  AuthorDoc, BlogCommentDoc, BlogDoc, FavoriteDoc, LikeDoc, LikeTargetType,
  QuoteDoc, SubmissionDoc, TopicDoc, UserCollection, UserDoc,
} from "./types";
import { AUTHORS, QUOTES, TOPICS, getAuthor } from "./data";
import { BLOG_SEED } from "./blog-seed";

const now = () => Date.now();
const toMillis = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof (v as { toMillis?: unknown }).toMillis === "function")
    return (v as { toMillis: () => number }).toMillis();
  if (typeof (v as { seconds?: unknown }).seconds === "number")
    return (v as { seconds: number }).seconds * 1000;
  return 0;
};

// --- Converters: Firestore doc <-> app type (timestamps become ms numbers) ---

function quoteFromSnap(id: string, d: DocumentData): QuoteDoc {
  return {
    id,
    text: d.text ?? "",
    authorId: d.authorId ?? "",
    authorName: d.authorName ?? getAuthor(d.authorId ?? "")?.name ?? d.authorId ?? "",
    topics: d.topics ?? [],
    source: d.source ?? "",
    sourceUrl: d.sourceUrl ?? null,
    language: d.language ?? "en",
    status: d.status ?? "published",
    likeCount: d.likeCount ?? 0,
    favoriteCount: d.favoriteCount ?? 0,
    viewCount: d.viewCount ?? 0,
    shareCount: d.shareCount ?? 0,
    copyCount: d.copyCount ?? 0,
    featured: d.featured ?? false,
    createdBy: d.createdBy ?? null,
    searchKeywords: d.searchKeywords ?? [],
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function authorFromSnap(id: string, d: DocumentData): AuthorDoc {
  return {
    id,
    slug: d.slug ?? id,
    name: d.name ?? "",
    epithet: d.epithet ?? "",
    lifespan: d.lifespan ?? "",
    bio: d.bio ?? "",
    era: d.era ?? null,
    born: d.born ?? null,
    died: d.died ?? null,
    imageUrl: d.imageUrl ?? null,
    quoteCount: d.quoteCount ?? 0,
    likeCount: d.likeCount ?? 0,
    viewCount: d.viewCount ?? 0,
    featured: d.featured ?? false,
    status: d.status ?? "published",
    searchKeywords: d.searchKeywords ?? [],
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

// --- Seed fallbacks (same shape as Firestore docs, counters 0) ---

export function seedQuotes(): QuoteDoc[] {
  return QUOTES.map((q) => ({
    id: q.id,
    text: q.text,
    authorId: q.authorId,
    authorName: getAuthor(q.authorId)?.name ?? q.authorId,
    topics: q.topics,
    source: q.source,
    sourceUrl: null,
    language: "en",
    status: "published",
    likeCount: 0, favoriteCount: 0, viewCount: 0, shareCount: 0, copyCount: 0,
    featured: false, createdBy: null, searchKeywords: [], createdAt: 0, updatedAt: 0,
  }));
}
export function seedAuthors(): AuthorDoc[] {
  return AUTHORS.map((a, i) => ({
    id: a.id, slug: a.id, name: a.name, epithet: a.epithet, lifespan: a.lifespan,
    bio: a.bio, era: null, born: null, died: null, imageUrl: null,
    quoteCount: QUOTES.filter((q) => q.authorId === a.id).length,
    likeCount: 0, viewCount: 0, featured: i < 6, status: "published",
    searchKeywords: [], createdAt: 0, updatedAt: 0,
  }));
}
export function seedTopics(): TopicDoc[] {
  return TOPICS.map((t) => ({
    slug: t.slug, name: t.name, description: t.description,
    quoteCount: QUOTES.filter((q) => q.topics.includes(t.slug)).length,
    likeCount: 0, imageUrl: null, featured: false, createdAt: 0,
  }));
}
export function seedBlogs(): BlogDoc[] { return BLOG_SEED; }

// --- Quotes ---

export type QuoteListOpts = {
  authorId?: string;
  topic?: string;
  search?: string;
  sort?: "newest" | "most-liked" | "most-favorited";
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
};

export async function listQuotes(opts: QuoteListOpts = {}): Promise<{
  quotes: QuoteDoc[]; lastCursor: QueryDocumentSnapshot<DocumentData> | null;
}> {
  const db = getDb();
  if (!db) {
    let list = seedQuotes();
    if (opts.authorId) list = list.filter((q) => q.authorId === opts.authorId);
    if (opts.topic) list = list.filter((q) => q.topics.includes(opts.topic!));
    if (opts.search) {
      const n = opts.search.toLowerCase();
      list = list.filter((q) => q.text.toLowerCase().includes(n) || q.authorName.toLowerCase().includes(n));
    }
    return { quotes: list.slice(0, opts.pageSize ?? 100), lastCursor: null };
  }
  try {
    const constraints: unknown[] = [where("status", "==", "published")];
    if (opts.authorId) constraints.push(where("authorId", "==", opts.authorId));
    if (opts.topic) constraints.push(where("topics", "array-contains", opts.topic));
    const sortField = opts.sort === "most-liked" ? "likeCount"
      : opts.sort === "most-favorited" ? "favoriteCount" : "createdAt";
    constraints.push(orderBy(sortField, "desc"));
    if (opts.cursor) constraints.push(startAfter(opts.cursor));
    constraints.push(limit(opts.pageSize ?? 24));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = await getDocs(query(collection(db, "quotes"), ...(constraints as any)));
    let quotes = snap.docs.map((d) => quoteFromSnap(d.id, d.data()));
    if (opts.search) {
      const n = opts.search.toLowerCase();
      quotes = quotes.filter((q) => q.text.toLowerCase().includes(n) || q.authorName.toLowerCase().includes(n));
    }
    return { quotes, lastCursor: snap.docs[snap.docs.length - 1] ?? null };
  } catch {
    return { quotes: seedQuotes().slice(0, opts.pageSize ?? 24), lastCursor: null };
  }
}

export async function getQuote(id: string): Promise<QuoteDoc | null> {
  const db = getDb();
  if (!db) return seedQuotes().find((q) => q.id === id) ?? null;
  try {
    const snap = await getDoc(doc(db, "quotes", id));
    if (!snap.exists()) return seedQuotes().find((q) => q.id === id) ?? null;
    return quoteFromSnap(snap.id, snap.data());
  } catch {
    return seedQuotes().find((q) => q.id === id) ?? null;
  }
}

export async function incrementQuoteCounter(id: string, field: "viewCount" | "shareCount" | "copyCount"): Promise<void> {
  const db = getDb();
  if (!db) return;
  try { await updateDoc(doc(db, "quotes", id), { [field]: increment(1) }); } catch { /* offline / seed id */ }
}

// --- Authors / Topics ---

export async function listAuthors(): Promise<AuthorDoc[]> {
  const db = getDb();
  if (!db) return seedAuthors();
  try {
    const snap = await getDocs(query(collection(db, "authors"), where("status", "==", "published"), orderBy("name")));
    if (snap.empty) return seedAuthors();
    return snap.docs.map((d) => authorFromSnap(d.id, d.data()));
  } catch { return seedAuthors(); }
}

export async function getAuthorDoc(id: string): Promise<AuthorDoc | null> {
  const db = getDb();
  if (!db) return seedAuthors().find((a) => a.id === id) ?? null;
  try {
    const snap = await getDoc(doc(db, "authors", id));
    if (!snap.exists()) return seedAuthors().find((a) => a.id === id) ?? null;
    return authorFromSnap(snap.id, snap.data());
  } catch { return seedAuthors().find((a) => a.id === id) ?? null; }
}

export async function listTopics(): Promise<TopicDoc[]> {
  const db = getDb();
  if (!db) return seedTopics();
  try {
    const snap = await getDocs(query(collection(db, "topics"), orderBy("name")));
    if (snap.empty) return seedTopics();
    return snap.docs.map((d) => ({ slug: d.id, name: d.data().name ?? d.id, description: d.data().description ?? "", quoteCount: d.data().quoteCount ?? 0, likeCount: d.data().likeCount ?? 0, imageUrl: d.data().imageUrl ?? null, featured: d.data().featured ?? false, createdAt: toMillis(d.data().createdAt) }));
  } catch { return seedTopics(); }
}

// --- Blogs ---

export async function listBlogs(opts: { tag?: string; featuredOnly?: boolean; pageSize?: number } = {}): Promise<BlogDoc[]> {
  const db = getDb();
  if (!db) {
    let list = seedBlogs().filter((b) => b.status === "published");
    if (opts.tag) list = list.filter((b) => b.tags.includes(opts.tag!) || b.topics.includes(opts.tag!));
    if (opts.featuredOnly) list = list.filter((b) => b.featured);
    return list;
  }
  try {
    const constraints: unknown[] = [where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(opts.pageSize ?? 24)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = await getDocs(query(collection(db, "blogs"), ...(constraints as any)));
    let list = snap.docs.map((d) => ({ id: d.id, ...d.data(), publishedAt: toMillis(d.data().publishedAt), createdAt: toMillis(d.data().createdAt), updatedAt: toMillis(d.data().updatedAt) } as BlogDoc));
    if (snap.empty) list = seedBlogs().filter((b) => b.status === "published");
    if (opts.tag) list = list.filter((b) => b.tags.includes(opts.tag!) || b.topics.includes(opts.tag!));
    if (opts.featuredOnly) list = list.filter((b) => b.featured);
    return list;
  } catch { return seedBlogs().filter((b) => b.status === "published"); }
}

export async function getBlogBySlug(slug: string): Promise<BlogDoc | null> {
  const db = getDb();
  if (!db) return seedBlogs().find((b) => b.slug === slug) ?? null;
  try {
    const snap = await getDocs(query(collection(db, "blogs"), where("slug", "==", slug), limit(1)));
    if (snap.empty) return seedBlogs().find((b) => b.slug === slug) ?? null;
    const d = snap.docs[0]!;
    return { id: d.id, ...d.data(), publishedAt: toMillis(d.data().publishedAt), createdAt: toMillis(d.data().createdAt), updatedAt: toMillis(d.data().updatedAt) } as BlogDoc;
  } catch { return seedBlogs().find((b) => b.slug === slug) ?? null; }
}

export async function listBlogComments(blogId: string): Promise<BlogCommentDoc[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "blogs", blogId, "comments"), where("status", "==", "published"), orderBy("createdAt", "asc"), limit(50)));
    return snap.docs.map((d) => ({ id: d.id, blogId, userId: d.data().userId ?? "", userName: d.data().userName ?? "", userPhotoURL: d.data().userPhotoURL ?? null, text: d.data().text ?? "", likeCount: d.data().likeCount ?? 0, status: d.data().status ?? "published", createdAt: toMillis(d.data().createdAt) }));
  } catch { return []; }
}

export async function addBlogComment(blogId: string, user: { uid: string; displayName: string; photoURL: string | null }, text: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const ref = doc(collection(db, "blogs", blogId, "comments"));
  await setDoc(ref, { userId: user.uid, userName: user.displayName, userPhotoURL: user.photoURL, text: text.slice(0, 2000), likeCount: 0, status: "published", createdAt: serverTimestamp() });
  await updateDoc(doc(db, "blogs", blogId), { commentCount: increment(1) });
}

// --- Users ---

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { uid: snap.id, displayName: d.displayName ?? "", email: d.email ?? "", photoURL: d.photoURL ?? null, bio: d.bio ?? "", role: d.role ?? "reader", provider: d.provider ?? "", isBanned: d.isBanned ?? false, stats: { likesGiven: d.stats?.likesGiven ?? 0, favoritesCount: d.stats?.favoritesCount ?? 0, contributionsCount: d.stats?.contributionsCount ?? 0, commentsCount: d.stats?.commentsCount ?? 0 }, preferences: { newsletter: d.preferences?.newsletter ?? false, theme: d.preferences?.theme ?? "light" }, createdAt: toMillis(d.createdAt), lastLoginAt: toMillis(d.lastLoginAt) };
}

export async function ensureUserDoc(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null; providerId?: string }): Promise<void> {
  const db = getDb();
  if (!db) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { displayName: user.displayName ?? "Reader", email: user.email ?? "", photoURL: user.photoURL, bio: "", role: "reader", provider: user.providerId ?? "unknown", isBanned: false, stats: { likesGiven: 0, favoritesCount: 0, contributionsCount: 0, commentsCount: 0 }, preferences: { newsletter: false, theme: "light" }, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
  } else {
    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
  }
}

export async function updateUserProfile(uid: string, patch: { displayName?: string; bio?: string; photoURL?: string | null; preferences?: { newsletter?: boolean; theme?: string } }): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, "users", uid), { ...patch, updatedAt: serverTimestamp() });
}

// --- Likes / Favorites (transactions, counter-safe) ---

function targetCollection(targetType: LikeTargetType): string {
  if (targetType === "quote") return "quotes";
  if (targetType === "blog") return "blogs";
  if (targetType === "author") return "authors";
  return "blogs"; // comment likes live on the comment doc; handled by caller if needed
}

export async function toggleLike(uid: string, targetType: LikeTargetType, targetId: string): Promise<boolean> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const likeId = `${uid}_${targetType}_${targetId}`;
  const likeRef = doc(db, "likes", likeId);
  const targetRef = doc(db, targetCollection(targetType), targetId);
  const userRef = doc(db, "users", uid);
  let liked = false;
  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    if (likeSnap.exists()) {
      tx.delete(likeRef);
      tx.update(targetRef, { likeCount: increment(-1) });
      tx.update(userRef, { "stats.likesGiven": increment(-1) });
      liked = false;
    } else {
      tx.set(likeRef, { userId: uid, targetType, targetId, createdAt: serverTimestamp() });
      tx.update(targetRef, { likeCount: increment(1) });
      tx.update(userRef, { "stats.likesGiven": increment(1) });
      liked = true;
    }
  });
  return liked;
}

export async function getUserLikes(uid: string): Promise<LikeDoc[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, "likes"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(500)));
  return snap.docs.map((d) => ({ id: d.id, userId: d.data().userId, targetType: d.data().targetType, targetId: d.data().targetId, createdAt: toMillis(d.data().createdAt) }));
}

export async function toggleFavorite(uid: string, quoteId: string): Promise<boolean> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const favId = `${uid}_${quoteId}`;
  const favRef = doc(db, "favorites", favId);
  const quoteRef = doc(db, "quotes", quoteId);
  const userRef = doc(db, "users", uid);
  let fav = false;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(favRef);
    if (snap.exists()) {
      tx.delete(favRef);
      tx.update(quoteRef, { favoriteCount: increment(-1) });
      tx.update(userRef, { "stats.favoritesCount": increment(-1) });
      fav = false;
    } else {
      tx.set(favRef, { userId: uid, quoteId, createdAt: serverTimestamp() });
      tx.update(quoteRef, { favoriteCount: increment(1) });
      tx.update(userRef, { "stats.favoritesCount": increment(1) });
      fav = true;
    }
  });
  return fav;
}

export async function getUserFavorites(uid: string): Promise<FavoriteDoc[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, "favorites"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(500)));
  return snap.docs.map((d) => ({ id: d.id, userId: d.data().userId, quoteId: d.data().quoteId, createdAt: toMillis(d.data().createdAt) }));
}

// --- Collections + Submissions ---

export async function listUserCollections(uid: string): Promise<UserCollection[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, "collections"), where("userId", "==", uid), orderBy("updatedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, userId: d.data().userId, name: d.data().name, description: d.data().description ?? "", quoteIds: d.data().quoteIds ?? [], isPublic: d.data().isPublic ?? false, createdAt: toMillis(d.data().createdAt), updatedAt: toMillis(d.data().updatedAt) }));
}

export async function createCollection(uid: string, name: string, description: string, isPublic: boolean): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const ref = doc(collection(db, "collections"));
  await setDoc(ref, { userId: uid, name, description, quoteIds: [], isPublic, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function createSubmission(uid: string, submittedByName: string, type: SubmissionDoc["type"], payload: Record<string, unknown>): Promise<string> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const ref = doc(collection(db, "submissions"));
  await setDoc(ref, { type, submittedBy: uid, submittedByName, status: "pending", payload, reviewNote: null, createdAt: serverTimestamp(), reviewedAt: null, reviewedBy: null });
  await updateDoc(doc(db, "users", uid), { "stats.contributionsCount": increment(1) });
  return ref.id;
}

export async function subscribeNewsletter(email: string, source = "footer"): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  // base64url without Node Buffer (this runs in the browser).
  const id = btoa(unescape(encodeURIComponent(email.toLowerCase()))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  await setDoc(doc(db, "newsletter_subscribers", id), { email: email.toLowerCase(), source, status: "subscribed", subscribedAt: serverTimestamp() }, { merge: true });
}

export function firebaseReady(): boolean { return isFirebaseConfigured(); }
export { now };

// --- Collections CRUD (extra helpers for /profile) ---

export async function updateCollection(id: string, patch: { name?: string; description?: string; isPublic?: boolean }): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, "collections", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteCollection(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "collections", id));
}

export async function addQuoteToCollection(id: string, quoteId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { arrayUnion } = await import("firebase/firestore");
  await updateDoc(doc(db, "collections", id), { quoteIds: arrayUnion(quoteId), updatedAt: serverTimestamp() });
}

export async function removeQuoteFromCollection(id: string, quoteId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { arrayRemove } = await import("firebase/firestore");
  await updateDoc(doc(db, "collections", id), { quoteIds: arrayRemove(quoteId), updatedAt: serverTimestamp() });
}

// --- Submissions + public profile reads ---

export async function listUserSubmissions(uid: string): Promise<SubmissionDoc[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "submissions"), where("submittedBy", "==", uid), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map((d) => ({ id: d.id, type: d.data().type, submittedBy: d.data().submittedBy, submittedByName: d.data().submittedByName ?? "", status: d.data().status ?? "pending", payload: d.data().payload ?? {}, reviewNote: d.data().reviewNote ?? null, createdAt: toMillis(d.data().createdAt), reviewedAt: toMillis(d.data().reviewedAt), reviewedBy: d.data().reviewedBy ?? null }));
  } catch { return []; }
}

export async function listPublicCollectionsByUser(uid: string): Promise<UserCollection[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "collections"), where("userId", "==", uid), where("isPublic", "==", true), orderBy("updatedAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, userId: d.data().userId, name: d.data().name, description: d.data().description ?? "", quoteIds: d.data().quoteIds ?? [], isPublic: d.data().isPublic ?? false, createdAt: toMillis(d.data().createdAt), updatedAt: toMillis(d.data().updatedAt) }));
  } catch { return []; }
}
