"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { QUOTES, getQuote as getStaticQuote } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import { useAuth } from "@/lib/auth-context";
import {
  getUserFavorites, getUserLikes, updateUserProfile,
  listUserCollections, createCollection, updateCollection, deleteCollection,
  addQuoteToCollection, removeQuoteFromCollection, listUserSubmissions,
} from "@/lib/db";
import type { UserCollection, SubmissionDoc } from "@/lib/types";
import { getFavourites } from "@/lib/favorites";
import { getMyLikedIds } from "@/lib/likes";
import {
  getLocalCollections, createLocalCollection, updateLocalCollection,
  deleteLocalCollection, toggleQuoteInLocalCollection,
} from "@/lib/collections-local";
import { getFirebaseAuth } from "@/lib/firebase";

type Tab = "overview" | "favourites" | "collections" | "contributions" | "liked" | "settings";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "favourites", label: "Favourites" },
  { id: "collections", label: "My Collections" },
  { id: "contributions", label: "My Contributions" },
  { id: "liked", label: "Liked" },
  { id: "settings", label: "Settings" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "S") + (p[1]?.[0] ?? "")).toUpperCase();
}

function ProfileInner() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "overview");
  const { user, profile, loading } = useAuth();
  const [favIds, setFavIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionDoc[]>([]);
  const [stats, setStats] = useState({ likesGiven: 0, favoritesCount: 0, contributionsCount: 0, commentsCount: 0 });

  // Collection editor state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(false);
  const [collectionMsg, setCollectionMsg] = useState("");

  // Settings state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [passwordMsg, setPasswordMsg] = useState("");

  const reload = useCallback(async () => {
    if (user) {
      try {
        const [f, l, c, s] = await Promise.all([
          getUserFavorites(user.uid), getUserLikes(user.uid),
          listUserCollections(user.uid), listUserSubmissions(user.uid),
        ]);
        setFavIds(f.map((x) => x.quoteId));
        setLikedIds(l.filter((x) => x.targetType === "quote").map((x) => x.targetId));
        setCollections(c);
        setSubmissions(s);
        return;
      } catch { /* fall through to local */ }
    }
    setFavIds(getFavourites());
    setLikedIds([...await getMyLikedIds("quote")]);
    setCollections(getLocalCollections());
    setSubmissions([]);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (profile) {
      setName(profile.displayName); setBio(profile.bio); setPhotoURL(profile.photoURL ?? "");
      setNewsletter(profile.preferences.newsletter); setTheme(profile.preferences.theme);
      setStats(profile.stats);
    }
  }, [profile]);
  useEffect(() => { setStats((s) => ({ ...s, favoritesCount: favIds.length, likesGiven: likedIds.length })); }, [favIds, likedIds]);

  const favQuotes = useMemo(() => favIds.map((id) => getStaticQuote(id)).filter((q): q is NonNullable<typeof q> => Boolean(q)), [favIds]);
  const likedQuotes = useMemo(() => likedIds.map((id) => getStaticQuote(id)).filter((q): q is NonNullable<typeof q> => Boolean(q)), [likedIds]);

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { setCollectionMsg("Collection name is required."); return; }
    try {
      if (user) await createCollection(user.uid, newName.trim(), newDesc.trim(), newPublic);
      else createLocalCollection(newName.trim(), newDesc.trim(), newPublic);
      setNewName(""); setNewDesc(""); setNewPublic(false); setCollectionMsg("Collection created.");
      await reload();
    } catch (err) { setCollectionMsg(err instanceof Error ? err.message : "Could not create collection."); }
  }

  async function handleUpdateCollection(id: string) {
    try {
      if (user) await updateCollection(id, { name: editName.trim(), description: editDesc.trim(), isPublic: editPublic });
      else updateLocalCollection(id, { name: editName.trim(), description: editDesc.trim(), isPublic: editPublic });
      setEditingId(null); await reload();
    } catch (err) { setCollectionMsg(err instanceof Error ? err.message : "Could not update collection."); }
  }

  async function handleDeleteCollection(id: string) {
    if (!confirm("Delete this collection? Its quotes stay in the library.")) return;
    try {
      if (user) await deleteCollection(id);
      else deleteLocalCollection(id);
      await reload();
    } catch (err) { setCollectionMsg(err instanceof Error ? err.message : "Could not delete collection."); }
  }

  async function handleToggleQuoteInCollection(collectionId: string, quoteId: string) {
    try {
      const col = collections.find((c) => c.id === collectionId);
      if (!col) return;
      if (user) {
        if (col.quoteIds.includes(quoteId)) await removeQuoteFromCollection(collectionId, quoteId);
        else await addQuoteToCollection(collectionId, quoteId);
      } else toggleQuoteInLocalCollection(collectionId, quoteId);
      await reload();
    } catch (err) { setCollectionMsg(err instanceof Error ? err.message : "Could not update collection."); }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (user) {
      try {
        await updateUserProfile(user.uid, { displayName: name, bio, photoURL: photoURL || null, preferences: { newsletter, theme } });
        setSaved(true); return;
      } catch { /* preview */ }
    }
    setSaved(true);
  }

  async function sendPasswordReset() {
    const auth = getFirebaseAuth();
    if (!auth || !user?.email) { setPasswordMsg("Password reset needs a configured Firebase project and a signed-in email account."); return; }
    const { sendPasswordResetEmail } = await import("firebase/auth");
    try { await sendPasswordResetEmail(auth, user.email); setPasswordMsg("Password reset email sent. Check your inbox."); }
    catch (err) { setPasswordMsg(err instanceof Error ? err.message : "Could not send reset email."); }
  }

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8"><p>Loading…</p></div>;

  const displayName = profile?.displayName || user?.displayName || "Reader";
  const joined = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header card */}
      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        {photoURL || profile?.photoURL || user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(photoURL || profile?.photoURL || user?.photoURL) ?? ""} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)] font-serif text-2xl font-bold text-white">{initials(displayName)}</span>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <p className="text-[var(--muted-foreground)]">{bio || profile?.bio || "No bio yet — add one in Settings."}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {user ? `Signed in as ${user.email}` : "Guest — sign in to sync across devices."}
            {joined ? ` · Joined ${joined}` : ""}
            {profile?.role ? ` · ${profile.role}` : ""}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {!user && <Link href="/login" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Log in</Link>}
          <Link href="/contribute" className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm">Contribute</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Your stats">
        {[
          ["Likes given", stats.likesGiven],
          ["Favourites", stats.favoritesCount],
          ["Contributions", stats.contributionsCount || submissions.length],
          ["Comments", stats.commentsCount],
          ["Collections", collections.length],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Profile sections">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`rounded-full px-4 py-2 text-sm ${tab === t.id ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <section className="mt-6 space-y-6">
          <div>
            <div className="flex items-baseline justify-between"><h2 className="text-xl font-bold">Recent favourites</h2><button type="button" onClick={() => setTab("favourites")} className="text-sm text-[var(--primary)] hover:underline">View all</button></div>
            {favQuotes.length === 0 ? <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No favourites yet. Save quotes with ☆ Save. <Link href="/quotes" className="text-[var(--primary)] hover:underline">Browse quotes</Link></p> : (
              <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{favQuotes.slice(0, 3).map((q) => <QuoteCard key={q.id} quote={q} />)}</div>
            )}
          </div>
          <div>
            <div className="flex items-baseline justify-between"><h2 className="text-xl font-bold">Collections</h2><button type="button" onClick={() => setTab("collections")} className="text-sm text-[var(--primary)] hover:underline">Manage</button></div>
            {collections.length === 0 ? <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No collections yet. Create one to group quotes by mood, theme, or reading list.</p> : (
              <ul className="mt-3 space-y-2">{collections.slice(0, 3).map((c) => <li key={c.id} className="rounded-xl border border-[var(--border)] bg-white p-4"><p className="font-medium">{c.name} <span className="text-xs text-[var(--muted-foreground)]">{c.isPublic ? "· Public" : "· Private"} · {c.quoteIds.length} quotes</span></p><p className="text-sm text-[var(--muted-foreground)]">{c.description || "No description."}</p></li>)}</ul>
            )}
          </div>
        </section>
      )}

      {/* Favourites */}
      {tab === "favourites" && (
        <section className="mt-6">
          <h2 className="text-xl font-bold">Favourites ({favQuotes.length})</h2>
          {favQuotes.length === 0 ? <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No favourites yet. Save quotes with ☆ Save on any quote card. <Link href="/quotes" className="text-[var(--primary)] hover:underline">Browse quotes</Link></p> : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{favQuotes.map((q) => <QuoteCard key={q.id} quote={q} />)}</div>
          )}
        </section>
      )}

      {/* Collections */}
      {tab === "collections" && (
        <section className="mt-6">
          <h2 className="text-xl font-bold">My Collections</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{user ? "Saved to your account." : "Guest preview — collections save in this browser until you sign in."}</p>
          <form onSubmit={handleCreateCollection} className="mt-4 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <label htmlFor="col-name" className="sr-only">Collection name</label>
            <input id="col-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New collection name…" className="flex-1 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <input aria-label="Collection description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="flex-1 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={newPublic} onChange={(e) => setNewPublic(e.target.checked)} /> Public</label>
            <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Create</button>
          </form>
          {collectionMsg && <p className="mt-2 text-sm" role="status">{collectionMsg}</p>}
          {collections.length === 0 ? <p className="mt-4 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No collections yet.</p> : (
            <ul className="mt-4 space-y-4">
              {collections.map((c) => (
                <li key={c.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  {editingId === c.id ? (
                    <div className="flex flex-wrap gap-2">
                      <input aria-label="Edit collection name" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm" />
                      <input aria-label="Edit collection description" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm" />
                      <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={editPublic} onChange={(e) => setEditPublic(e.target.checked)} /> Public</label>
                      <button type="button" onClick={() => handleUpdateCollection(c.id)} className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm text-white">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{c.name} <span className="text-xs text-[var(--muted-foreground)]">{c.isPublic ? "· Public" : "· Private"} · {c.quoteIds.length} quotes</span></p>
                        <div className="ml-auto flex gap-2">
                          <button type="button" onClick={() => { setEditingId(c.id); setEditName(c.name); setEditDesc(c.description); setEditPublic(c.isPublic); }} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs">Rename</button>
                          <button type="button" onClick={() => handleDeleteCollection(c.id)} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs">Delete</button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.description || "No description."}</p>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-[var(--primary)]">Add / remove quotes</summary>
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          {QUOTES.slice(0, 12).map((q) => (
                            <label key={q.id} className="flex items-start gap-2 rounded-md border border-[var(--border)] p-2 text-sm">
                              <input type="checkbox" checked={c.quoteIds.includes(q.id)} onChange={() => handleToggleQuoteInCollection(c.id, q.id)} className="mt-0.5" />
                              <span className="line-clamp-2">{q.text}</span>
                            </label>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">Showing the first 12 quotes for quick adding. Open any quote to save it to favourites too.</p>
                      </details>
                      {c.quoteIds.length > 0 && (
                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                          {c.quoteIds.map((qid) => { const q = getStaticQuote(qid); return q ? <QuoteCard key={qid} quote={q} /> : null; })}
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Contributions */}
      {tab === "contributions" && (
        <section className="mt-6">
          <h2 className="text-xl font-bold">My Contributions ({submissions.length})</h2>
          {!user ? <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">Sign in to see your submissions. <Link href="/login" className="text-[var(--primary)] hover:underline">Log in</Link></p> : submissions.length === 0 ? (
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No contributions yet. <Link href="/contribute" className="text-[var(--primary)] hover:underline">Submit a quote</Link> — every suggestion is reviewed before publishing.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {submissions.map((s) => (
                <li key={s.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[s.status] ?? "bg-gray-100"}`}>{s.status}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{s.type} · {new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{String(s.payload.text ?? s.payload.title ?? JSON.stringify(s.payload))}</p>
                  {s.reviewNote && <p className="mt-1 text-sm text-[var(--muted-foreground)]">Reviewer note: {s.reviewNote}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Liked */}
      {tab === "liked" && (
        <section className="mt-6">
          <h2 className="text-xl font-bold">Liked quotes ({likedQuotes.length})</h2>
          {likedQuotes.length === 0 ? <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No liked quotes yet. Tap ♡ Like on any quote. <Link href="/quotes" className="text-[var(--primary)] hover:underline">Browse quotes</Link></p> : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{likedQuotes.map((q) => <QuoteCard key={q.id} quote={q} />)}</div>
          )}
        </section>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <section className="mt-6 space-y-6">
          <form onSubmit={saveSettings} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-bold">Profile settings</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div><label htmlFor="set-name" className="block text-sm font-medium">Display name</label><input id="set-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
              <div><label htmlFor="set-photo" className="block text-sm font-medium">Photo URL</label><input id="set-photo" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://…" className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
              <div className="sm:col-span-2"><label htmlFor="set-bio" className="block text-sm font-medium">Bio</label><textarea id="set-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> Weekly newsletter</label>
              <div><label htmlFor="set-theme" className="block text-sm font-medium">Theme</label><select id="set-theme" value={theme} onChange={(e) => setTheme(e.target.value)} className="mt-1 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"><option value="light">Light</option><option value="dark">Dark (saved preference; dark theme styles arrive with the theme release)</option></select></div>
            </div>
            <button type="submit" className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-white">Save settings</button>
            {saved && <p className="mt-2 text-sm" role="status">Saved{user ? " to your profile." : " in this browser (preview only)."}</p>}
          </form>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-bold">Password</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Send yourself a password-reset email.</p>
            <button type="button" onClick={sendPasswordReset} className="mt-3 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm">Send password reset email</button>
            {passwordMsg && <p className="mt-2 text-sm" role="status">{passwordMsg}</p>}
          </div>
          <div className="rounded-xl border border-red-200 bg-white p-5">
            <h2 className="text-lg font-bold text-red-700">Delete account</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">This removes your profile, favourites, likes, collections, and submissions from StoicBare. This cannot be undone.</p>
            {deleteStep === 0 ? (
              <button type="button" onClick={() => setDeleteStep(1)} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white">Delete my account</button>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-medium">Are you sure? This is permanent.</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setDeleteStep(0)} className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm">Cancel</button>
                  <button type="button" onClick={() => { setDeleteStep(2); }} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">Yes, delete everything</button>
                </div>
              </div>
            )}
            {deleteStep === 2 && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm" role="status">Account deletion is a placeholder in this build: no data was deleted. Connect the admin delete flow (Auth user + Firestore user doc + likes/favourites/collections) before enabling this button for real.</p>}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return <Suspense><ProfileInner /></Suspense>;
}
