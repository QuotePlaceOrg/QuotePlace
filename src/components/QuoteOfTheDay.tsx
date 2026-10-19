import Link from "next/link";
import { quoteOfTheDay, getAuthor } from "@/lib/data";
import CopyButton from "./CopyButton";
import ShareButtons from "./ShareButtons";
export default function QuoteOfTheDay() {
  const q = quoteOfTheDay();
  const author = getAuthor(q.authorId);
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8" aria-labelledby="qotd">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Quote of the Day</p>
      <blockquote id="qotd" className="mt-3 font-serif text-2xl leading-snug md:text-3xl">“{q.text}”</blockquote>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">— {author?.name} · {q.source}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ShareButtons text={`"${q.text}" — ${author?.name ?? ""}`} url={`/quotes/${q.id}`} />
        <CopyButton text={`"${q.text}" — ${author?.name ?? ""}`} label="Copy quote" />
        <Link href={`/quotes/${q.id}`} className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs text-white">Read more</Link>
      </div>
    </section>
  );
}
