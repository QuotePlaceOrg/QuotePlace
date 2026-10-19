import Link from "next/link";
import { getUserDoc, listPublicCollectionsByUser } from "@/lib/db";
import { getQuote as getStaticQuote } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const profile = await getUserDoc(uid);
  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Profile not available</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">This profile is private, does not exist, or you need to sign in to view it.</p>
        <Link href="/quotes" className="mt-6 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Browse quotes</Link>
      </div>
    );
  }
  const collections = await listPublicCollectionsByUser(uid);
  const initials = profile.displayName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        {profile.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photoURL} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)] font-serif text-2xl font-bold text-white">{initials}</span>
        )}
        <div>
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
          <p className="text-[var(--muted-foreground)]">{profile.bio || "No bio yet."}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Joined {new Date(profile.createdAt).toLocaleDateString()} · {profile.stats.favoritesCount} favourites · {profile.stats.likesGiven} likes given · {collections.length} public collections</p>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold">Public collections</h2>
        {collections.length === 0 ? <p className="mt-3 rounded-xl border border-[var(--border)] bg-white p-5 text-sm">No public collections yet.</p> : (
          <ul className="mt-4 space-y-4">
            {collections.map((c) => (
              <li key={c.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-medium">{c.name} · {c.quoteIds.length} quotes</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.description || "No description."}</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {c.quoteIds.map((qid) => { const q = getStaticQuote(qid); return q ? <QuoteCard key={qid} quote={q} /> : null; })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
