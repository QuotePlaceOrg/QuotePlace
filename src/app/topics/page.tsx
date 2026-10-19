import Link from "next/link";
import { TOPICS, quotesByTopic } from "@/lib/data";
export default function TopicsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Topics</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Browse wisdom by what it is about.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => (
          <Link key={t.slug} href={`/topics/${t.slug}`} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-md">
            <p className="font-serif text-lg font-bold capitalize">{t.name}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t.description}</p>
            <p className="mt-3 text-xs font-medium">{quotesByTopic(t.slug).length} quotes</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
