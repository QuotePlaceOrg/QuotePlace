import { notFound } from "next/navigation";
import Link from "next/link";
import { TOPICS, getTopic, quotesByTopic } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import { listQuotes } from "@/lib/db";
export function generateStaticParams() { return TOPICS.map((t) => ({ slug: t.slug })); }
export default async function TopicDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const quotes = quotesByTopic(slug);
  // No topic-like button: Firestore has no topic like target, so showing a
  // like count here would be fake. Only real quote like counts are shown.
  const counts = new Map<string, number>();
  for (const q of (await listQuotes({ pageSize: 500 })).quotes) counts.set(q.id, q.likeCount);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/topics" className="text-sm text-[var(--primary)] hover:underline">← All topics</Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold capitalize">{topic.name}</h1>
      </div>
      <p className="mt-2 text-[var(--muted-foreground)]">{topic.description}</p>
      <p className="mt-2 text-sm"><strong>{quotes.length}</strong> quotes in this topic</p>
      {quotes.length === 0 ? <p className="mt-6 rounded-xl border border-[var(--border)] bg-white p-6 text-center text-sm">No quotes in this topic yet.</p> : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quotes.map((q) => <QuoteCard key={q.id} quote={q} likeCount={counts.get(q.id) ?? 0} />)}</div>
      )}
    </div>
  );
}
