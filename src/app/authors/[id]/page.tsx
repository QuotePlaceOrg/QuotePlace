import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHORS, getAuthor, quotesByAuthor } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import LikeButton from "@/components/LikeButton";
import { getAuthorDoc, listQuotes } from "@/lib/db";
export function generateStaticParams() { return AUTHORS.map((a) => ({ id: a.id })); }
export default async function AuthorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author) notFound();
  const quotes = quotesByAuthor(id);
  // Real Firestore counts (0 when the doc has none yet). Never invented.
  const authorDoc = await getAuthorDoc(id);
  const counts = new Map<string, number>();
  for (const q of (await listQuotes({ pageSize: 500 })).quotes) counts.set(q.id, q.likeCount);
  const initials = author.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/authors" className="text-sm text-[var(--primary)] hover:underline">← All authors</Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] font-serif text-2xl font-bold text-white">{initials}</span>
        <div>
          <h1 className="text-3xl font-bold">{author.name}</h1>
          <p className="text-[var(--muted-foreground)]">{author.epithet} · {author.lifespan}</p>
        </div>
        <div className="ml-auto"><LikeButton targetType="author" targetId={author.id} label="Like author" likeCount={authorDoc?.likeCount ?? 0} /></div>
      </div>
      <p className="mt-4 max-w-2xl text-[var(--muted-foreground)]">{author.bio}</p>
      <div className="mt-4 flex gap-4 text-sm">
        <span><strong>{quotes.length}</strong> quotes</span>
        <span>Era: Stoic &amp; classical thought</span>
      </div>
      <h2 className="mt-8 text-xl font-bold">{quotes.length} quotes by {author.name}</h2>
      {quotes.length === 0 ? <p className="mt-4 rounded-xl border border-[var(--border)] bg-white p-6 text-center text-sm">No quotes from this author yet.</p> : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quotes.map((q) => <QuoteCard key={q.id} quote={q} likeCount={counts.get(q.id) ?? 0} />)}</div>
      )}
    </div>
  );
}
