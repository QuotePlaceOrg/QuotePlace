"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { QuoteDoc } from "@/lib/types";
import QuoteCard from "@/components/QuoteCard";
import { useAuth } from "@/lib/auth-context";
import { getQuote } from "@/lib/db";
import { getMyFavouriteIds } from "@/lib/favorites";

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "G") + (p[1]?.[0] ?? "")).toUpperCase();
}

export default function ProfilePage() {
  const { user, profile, loading, logOut } = useAuth();
  const [quotes, setQuotes] = useState<QuoteDoc[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Saved ids (Firestore for signed-in, localStorage for guests) → resolved quotes.
  // Ids that no longer resolve are skipped silently.
  const loadSaved = useCallback(async (silent = false) => {
    if (!silent) { setLoadingQuotes(true); setLoadError(false); }
    try {
      const ids = await getMyFavouriteIds();
      const entries = await Promise.all(
        [...ids].map(async (id) => {
          try { return await getQuote(id); } catch { return null; }
        }),
      );
      setQuotes(entries.filter((q): q is QuoteDoc => Boolean(q)));
      if (!silent) setLoadError(false);
    } catch {
      if (!silent) setLoadError(true);
    } finally {
      if (!silent) setLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) void loadSaved();
  }, [loading, user?.uid, reloadKey, loadSaved]);

  useEffect(() => () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  // A Save/unsave inside a card has no callback prop, so re-read the saved
  // ids (silently, no loading flash) shortly after any click in the grid.
  // Unsave then removes the card from the grid right away.
  function handleGridClickCapture() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { void loadSaved(true); }, 400);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p>Loading your saved quotes…</p>
      </div>
    );
  }

  const displayName = profile?.displayName || user?.displayName || "Guest";
  const photoURL = profile?.photoURL || user?.photoURL || null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Minimal header: avatar + display name + sign out. Nothing else. */}
      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] font-serif text-xl font-bold text-white">{initials(displayName)}</span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {!user && <p className="text-sm text-[var(--muted-foreground)]">Guest — sign in to sync across devices.</p>}
        </div>
        <div className="ml-auto flex gap-2">
          {user ? (
            <button type="button" onClick={() => logOut()} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">Sign out</button>
          ) : (
            <Link href="/login" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Log in</Link>
          )}
        </div>
      </section>

      {/* Saved quotes — the only section on this page. */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">Saved quotes ({quotes.length})</h2>
        {loadingQuotes ? (
          <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">Loading your saved quotes…</p>
        ) : loadError ? (
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5">
            <p className="text-sm">Couldn&apos;t load your saved quotes. Check your connection and retry.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="mt-3 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Retry</button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5">
            <p className="text-sm">No saved quotes yet — browse quotes and tap Save on any quote you love.</p>
            <Link href="/quotes" className="mt-3 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Browse quotes</Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" onClickCapture={handleGridClickCapture}>
            {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
          </div>
        )}
      </section>
    </div>
  );
}
