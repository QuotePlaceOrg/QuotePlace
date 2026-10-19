// Favourites — Firestore when signed in + configured, localStorage fallback otherwise.
// Firestore is the source of truth once configured; local is a guest preview.
import { toggleFavorite as toggleFavoriteDb, getUserFavorites } from "./db";
import { getFirebaseAuth } from "./firebase";

export const FAV_KEY = "stoicbare:favourites";

export function getFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
}
export function isFavourite(id: string) { return getFavourites().includes(id); }

/** Toggle a favourite. Returns the new favourited state. */
export async function toggleFavourite(id: string): Promise<boolean> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (user) {
    try { return await toggleFavoriteDb(user.uid, id); } catch { /* fall through to local */ }
  }
  const cur = getFavourites();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next.includes(id);
}

/** Favourite quote ids for the current user (Firestore if signed in, else local). */
export async function getMyFavouriteIds(): Promise<Set<string>> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (user) {
    try {
      const favs = await getUserFavorites(user.uid);
      return new Set(favs.map((f) => f.quoteId));
    } catch { /* fall through */ }
  }
  return new Set(getFavourites());
}
