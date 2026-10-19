import { quoteOfTheDay, getAuthor } from "@/lib/data";
import ShareQuoteButton, { SaveQuoteButton } from "./ShareQuoteButton";
export default function QuoteOfTheDay() {
  const q = quoteOfTheDay();
  const author = getAuthor(q.authorId);
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8" aria-labelledby="qotd">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Quote of the Day</p>
      <blockquote id="qotd" className="mt-3 font-serif text-2xl leading-snug md:text-3xl">“{q.text}”</blockquote>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">— {author?.name} · {q.source}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ShareQuoteButton quoteId={q.id} text={q.text} authorName={author?.name ?? ""} source={q.source} />
        <SaveQuoteButton quoteId={q.id} />
      </div>
    </section>
  );
}
