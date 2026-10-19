import Link from "next/link";
import { TOPICS } from "@/lib/data";
import SearchBar from "@/components/SearchBar";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import QuoteCard from "@/components/QuoteCard";
import NewsletterForm from "@/components/NewsletterForm";
import { listQuotes } from "@/lib/db";

export const dynamic = "force-dynamic";

function toCardQuote(q: { id: string; text: string; authorId: string; topics: string[]; source: string }) {
  return { id: q.id, text: q.text, authorId: q.authorId, topics: q.topics, source: q.source, language: "en" as const };
}

export default async function Home() {
  // Trending = real Firestore order by likeCount. When every quote has 0
  // likes, this is just the seed order with honest 0 counts — never invented.
  const [{ quotes: trendingDocs }, { quotes: newestDocs }] = await Promise.all([
    listQuotes({ sort: "most-liked", pageSize: 6 }),
    listQuotes({ sort: "newest", pageSize: 15 }),
  ]);
  const trending = trendingDocs.map((q) => ({ quote: toCardQuote(q), likeCount: q.likeCount }));
  const inspirational = newestDocs.slice(6, 15).map((q) => ({ quote: toCardQuote(q), likeCount: q.likeCount }));
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero + search */}
      <section className="py-12 text-center md:py-16">
        <p className="font-serif text-6xl leading-none text-[var(--primary)]" aria-hidden="true">“ ”</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Discover Wisdom That Inspires</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted-foreground)]">StoicBare is a curated collection of the world&apos;s most thoughtful, time-tested quotes. Find motivation, clarity, and perspective — without noise.</p>
        <div className="mt-6 flex justify-center"><SearchBar /></div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {TOPICS.slice(0, 8).map((t) => <Link key={t.slug} href={`/topics/${t.slug}`} className="rounded-full bg-white px-3 py-1.5 text-sm capitalize shadow-sm hover:underline">{t.name}</Link>)}
        </div>
      </section>

      <div className="mt-12"><QuoteOfTheDay /></div>

      {/* Trending quotes */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between"><h2 className="text-2xl font-bold">Trending Quotes</h2><Link href="/quotes?sort=most-liked" className="text-sm text-[var(--primary)] hover:underline">Most liked →</Link></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trending.map(({ quote, likeCount }) => <QuoteCard key={quote.id} quote={quote} likeCount={likeCount} />)}
        </div>
      </section>

      {/* About */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between"><h2 className="text-2xl font-bold">About StoicBare</h2><Link href="/about" className="text-sm text-[var(--primary)] hover:underline">Read more</Link></div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"><h3 className="font-bold">Curated Collection</h3><p className="mt-2 text-sm text-[var(--muted-foreground)]">Carefully selected quotes from diverse sources, checked for correct attribution.</p></div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"><h3 className="font-bold">Community Driven</h3><p className="mt-2 text-sm text-[var(--muted-foreground)]">Readers can suggest quotes. Every submission is reviewed before it is published.</p></div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"><h3 className="font-bold">Daily Inspiration</h3><p className="mt-2 text-sm text-[var(--muted-foreground)]">A new Quote of the Day, every day — chosen deterministically so everyone sees the same one.</p></div>
        </div>
      </section>

      {/* Inspirational quotes grid */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between"><h2 className="text-2xl font-bold">Inspirational Quotes</h2><Link href="/quotes" className="text-sm text-[var(--primary)] hover:underline">Explore all quotes</Link></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inspirational.map(({ quote, likeCount }) => <QuoteCard key={quote.id} quote={quote} likeCount={likeCount} />)}
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-3 text-sm">
          <details className="rounded-md border border-[var(--border)] p-3"><summary className="cursor-pointer font-medium">What is StoicBare?</summary><p className="mt-2 text-[var(--muted-foreground)]">StoicBare is a focused library of public-domain quotes from long-dead thinkers, organised by author and topic.</p></details>
          <details className="rounded-md border border-[var(--border)] p-3"><summary className="cursor-pointer font-medium">Can I use quotes in my work?</summary><p className="mt-2 text-[var(--muted-foreground)]">These are short public-domain sayings. You may use them with attribution to the author.</p></details>
        </div>
        <Link href="/faq" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">View all FAQs</Link>
      </section>

      <section className="mt-12" id="newsletter">
        <NewsletterForm />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Browse by Topic</h2>
        <div className="mt-4 flex flex-wrap gap-2">{TOPICS.map((t) => <Link key={t.slug} href={`/topics/${t.slug}`} className="rounded-full bg-white px-3 py-1.5 text-sm capitalize shadow-sm hover:underline">{t.name}</Link>)}</div>
      </section>
    </div>
  );
}
