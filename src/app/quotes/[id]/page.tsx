import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthor } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import ShareQuoteButton, { SaveQuoteButton, ReportQuoteForm } from "@/components/ShareQuoteButton";
import { getQuote as getQuoteDoc, getAuthorDoc, listQuotes } from "@/lib/db";

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getQuoteDoc(id); // Firestore first, seed fallback inside db.ts
  if (!quote) notFound();
  const authorDoc = await getAuthorDoc(quote.authorId);
  const author = authorDoc ?? getAuthor(quote.authorId) ?? { id: quote.authorId, name: quote.authorName, epithet: "", lifespan: "", bio: "" };
  const all = (await listQuotes({ pageSize: 500 })).quotes;
  const related = all.filter((q) => q.authorId === quote.authorId && q.id !== quote.id).slice(0, 3);
  const more = all.filter((q) => q.id !== quote.id && q.topics.some((t) => quote.topics.includes(t))).slice(0, 3);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/quotes" className="text-sm text-[var(--primary)] hover:underline">← All quotes</Link>
      <article className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-10">
        <span className="font-serif text-5xl text-[var(--primary)]" aria-hidden="true">“</span>
        <blockquote className="font-serif text-3xl leading-snug">{quote.text}</blockquote>
        <p className="mt-4 text-[var(--muted-foreground)]">— {author?.name} · {quote.source}</p>
        <div className="mt-3 flex flex-wrap gap-1">{quote.topics.map((t) => <Link key={t} href={`/topics/${t}`} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs capitalize hover:underline">{t}</Link>)}</div>
        <div className="mt-6 flex flex-wrap gap-2">
          <ShareQuoteButton quoteId={quote.id} text={quote.text} authorName={author?.name ?? ""} source={quote.source} />
          <SaveQuoteButton quoteId={quote.id} />
          <ReportQuoteForm quoteId={quote.id} text={quote.text} />
        </div>
      </article>
      <section className="mt-10">
        <h2 className="text-xl font-bold">More from {author?.name}</h2>
        {related.length === 0 ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">No other quotes from this author yet.</p> : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">{related.map((q) => <QuoteCard key={q.id} quote={q} />)}</div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-bold">Related quotes</h2>
        {more.length === 0 ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">No related quotes yet.</p> : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">{more.map((q) => <QuoteCard key={q.id} quote={q} />)}</div>
        )}
      </section>
    </div>
  );
}
