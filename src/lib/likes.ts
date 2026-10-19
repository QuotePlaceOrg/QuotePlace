// Likes — Firestore is the ONLY source of truth for counts.
//
// Rules (per product requirement, no fake numbers):
// - Displayed like counts come ONLY from the `likeCount` prop, which callers
//   load from Firestore via db.ts (or 0 from the seed when Firestore has no
//   doc yet). Never invent, estimate, or merge in a local number.
// - localStorage stores ONLY the boolean "did this browser tap like" so the
//   heart can render. It never stores a count.
// - toggleLike returns { liked, persisted }. `persisted` is true ONLY when
//   the Firestore transaction succeeded. Callers adjust the displayed count
//   only when persisted is true; a guest/local tap changes the heart only,
//   and the count updates on the next Firestore read. No fake +1.
import type { LikeTargetType } from "./types";
import { toggleLike as toggleLikeDb, getUserLikes } from "./db";
import { getFirebaseAuth } from "./firebase";

const LIKED_KEY = "stoicbare:likes";

function readJson(key: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) || "{}") as Record<string, unknown>; } catch { return {}; }
}
function likedKey(t: LikeTargetType, id: string) { return `${t}:${id}`; }

export function getLocalLiked(targetType: LikeTargetType, targetId: string): boolean {
  return Boolean(readJson(LIKED_KEY)[likedKey(targetType, targetId)]);
}

/** Toggle a like. Returns the new liked state + whether Firestore persisted it. */
export async function toggleLike(targetType: LikeTargetType, targetId: string): Promise<{ liked: boolean; persisted: boolean }> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (user) {
    try {
      const liked = await toggleLikeDb(user.uid, targetType, targetId);
      const likedMap = readJson(LIKED_KEY);
      likedMap[likedKey(targetType, targetId)] = liked;
      localStorage.setItem(LIKED_KEY, JSON.stringify(likedMap));
      return { liked, persisted: true };
    } catch {
      // Firestore write failed (rules / offline) — heart only, count untouched.
    }
  }
  const key = likedKey(targetType, targetId);
  const likedMap = readJson(LIKED_KEY);
  const next = !likedMap[key];
  likedMap[key] = next;
  localStorage.setItem(LIKED_KEY, JSON.stringify(likedMap));
  return { liked: next, persisted: false };
}

/** All target ids of a type the current user liked (Firestore, else local). */
export async function getMyLikedIds(targetType: LikeTargetType): Promise<Set<string>> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (user) {
    try {
      const likes = await getUserLikes(user.uid);
      return new Set(likes.filter((l) => l.targetType === targetType).map((l) => l.targetId));
    } catch { /* fall through */ }
  }
  const out = new Set<string>();
  for (const [k, v] of Object.entries(readJson(LIKED_KEY))) {
    if (v && k.startsWith(`${targetType}:`)) out.add(k.slice(targetType.length + 1));
  }
  return out;
}
