"use client";
import Link from "next/link";
import type { Quote } from "@/lib/data";
import { getAuthor } from "@/lib/data";
import ShareQuoteButton, { SaveQuoteButton } from "./ShareQuoteButton";

// likeCount is accepted for call-site compatibility (other pages still pass
// it) but intentionally unused — Like UI was removed (Share + Save only).
export default function QuoteCard({ quote }: { quote: Quote; likeCount?: number }) {
  const author = getAuthor(quote.authorId);
  return (
    <article className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <span className="font-serif text-3xl leading-none text-[var(--primary)]" aria-hidden="true">“</span>
      <blockquote className="font-serif text-lg leading-relaxed">{quote.text}</blockquote>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">— {author?.name ?? quote.authorId} · {quote.source}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {quote.topics.map((t) => (
          <Link key={t} href={`/topics/${t}`} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs capitalize hover:underline">{t}</Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ShareQuoteButton quoteId={quote.id} text={quote.text} authorName={author?.name ?? quote.authorId} source={quote.source} />
        <SaveQuoteButton quoteId={quote.id} />
      </div>
    </article>
  );
}
