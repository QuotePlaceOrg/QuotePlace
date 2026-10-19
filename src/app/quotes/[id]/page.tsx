import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuote, getAuthor, quotesByAuthor, QUOTES } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import QuoteDetailActions from "@/components/QuoteDetailActions";
import AuthorCard from "@/components/AuthorCard";
import { getQuote as getQuoteDoc, listQuotes } from "@/lib/db";

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = getQuote(id);
  if (!quote) notFound();
  const author = getAuthor(quote.authorId);
  // Real Firestore like count (0 when the doc has none yet). Never invented.
  const doc = await getQuoteDoc(id);
  const realLikeCount = doc?.likeCount ?? 0;
  const counts = new Map<string, number>();
  for (const q of (await listQuotes({ pageSize: 500 })).quotes) counts.set(q.id, q.likeCount);
  const related = quotesByAuthor(quote.authorId).filter((q) => q.id !== quote.id).slice(0, 3);
  const more = QUOTES.filter((q) => q.id !== quote.id && q.topics.some((t) => quote.topics.includes(t))).slice(0, 3);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/quotes" className="text-sm text-[var(--primary)] hover:underline">← All quotes</Link>
      <article className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-10">
        <span className="font-serif text-5xl text-[var(--primary)]" aria-hidden="true">“</span>
        <blockquote className="font-serif text-3xl leading-snug">{quote.text}</blockquote>
        <p className="mt-4 text-[var(--muted-foreground)]">— <Link href={`/authors/${quote.authorId}`} className="text-[var(--primary)] hover:underline">{author?.name}</Link> · {quote.source}</p>
        <div className="mt-3 flex flex-wrap gap-1">{quote.topics.map((t) => <Link key={t} href={`/topics/${t}`} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs capitalize hover:underline">{t}</Link>)}</div>
        <QuoteDetailActions quoteId={quote.id} text={quote.text} authorName={author?.name ?? ""} likeCount={realLikeCount} />
      </article>
      {author && (
        <section className="mt-8" aria-label="About the author">
          <h2 className="text-xl font-bold">About the author</h2>
          <div className="mt-3"><AuthorCard author={author} /></div>
        </section>
      )}
      <section className="mt-10">
        <h2 className="text-xl font-bold">More from {author?.name}</h2>
        {related.length === 0 ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">No other quotes from this author yet.</p> : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">{related.map((q) => <QuoteCard key={q.id} quote={q} likeCount={counts.get(q.id) ?? 0} />)}</div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-bold">Related quotes</h2>
        {more.length === 0 ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">No related quotes yet.</p> : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">{more.map((q) => <QuoteCard key={q.id} quote={q} likeCount={counts.get(q.id) ?? 0} />)}</div>
        )}
      </section>
    </div>
  );
}
