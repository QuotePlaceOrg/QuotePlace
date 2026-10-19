// Local (guest) collections fallback — same shape as UserCollection.
// Used when no Firebase user is signed in. Stored in localStorage.
import type { UserCollection } from "./types";

const KEY = "stoicbare:collections";

export function getLocalCollections(): UserCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function save(list: UserCollection[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function createLocalCollection(name: string, description: string, isPublic: boolean): UserCollection {
  const c: UserCollection = {
    id: `local-${Date.now()}`,
    userId: "guest",
    name,
    description,
    quoteIds: [],
    isPublic,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  save([...getLocalCollections(), c]);
  return c;
}

export function updateLocalCollection(id: string, patch: Partial<UserCollection>): UserCollection[] {
  const next = getLocalCollections().map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c));
  save(next);
  return next;
}

export function deleteLocalCollection(id: string): UserCollection[] {
  const next = getLocalCollections().filter((c) => c.id !== id);
  save(next);
  return next;
}

export function toggleQuoteInLocalCollection(id: string, quoteId: string): UserCollection[] {
  const next = getLocalCollections().map((c) => {
    if (c.id !== id) return c;
    const has = c.quoteIds.includes(quoteId);
    return { ...c, quoteIds: has ? c.quoteIds.filter((q) => q !== quoteId) : [...c.quoteIds, quoteId], updatedAt: Date.now() };
  });
  save(next);
  return next;
}
