"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AUTHORS, QUOTES, TOPICS, getAuthor } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";
import { listQuotes } from "@/lib/db";

const PAGE_SIZE = 12;
type SortKey = "newest" | "most-liked" | "most-favorited";

function QuotesInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [topic, setTopic] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [sort, setSort] = useState<SortKey>((params.get("sort") as SortKey) || "newest");
  const [page, setPage] = useState(1);
  // Real Firestore counts for sorting. Empty map = not loaded yet → seed order.
  // Never sort by invented/local numbers.
  const [realCounts, setRealCounts] = useState<Record<string, { likeCount: number; favoriteCount: number }>>({});

  useEffect(() => { setQ(params.get("q") || ""); setSort((params.get("sort") as SortKey) || "newest"); setPage(1); }, [params]);
  useEffect(() => {
    let cancelled = false;
    listQuotes({ pageSize: 500 }).then(({ quotes }) => {
      if (cancelled) return;
      const map: Record<string, { likeCount: number; favoriteCount: number }> = {};
      for (const q of quotes) map[q.id] = { likeCount: q.likeCount, favoriteCount: q.favoriteCount };
      setRealCounts(map);
    }).catch(() => { /* offline → seed order, no fake numbers */ });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = QUOTES.filter((quote) => {
      if (topic && !quote.topics.includes(topic)) return false;
      if (authorId && quote.authorId !== authorId) return false;
      if (!needle) return true;
      const author = getAuthor(quote.authorId);
      return quote.text.toLowerCase().includes(needle) || quote.source.toLowerCase().includes(needle) || (author?.name.toLowerCase().includes(needle) ?? false) || quote.topics.some((t) => t.includes(needle));
    });
    if (sort === "most-liked") return [...list].sort((a, b) => (realCounts[b.id]?.likeCount ?? 0) - (realCounts[a.id]?.likeCount ?? 0));
    if (sort === "most-favorited") return [...list].sort((a, b) => (realCounts[b.id]?.favoriteCount ?? 0) - (realCounts[a.id]?.favoriteCount ?? 0));
    return list; // newest = seed order (seed is newest-first curated set)
  }, [q, topic, authorId, sort, realCounts]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">All Quotes</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">{filtered.length} quotes · {AUTHORS.length} authors · {TOPICS.length} topics</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="quotes-search">Search quotes</label>
        <input id="quotes-search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search quotes, authors…" className="w-full max-w-md rounded-md border border-[var(--border)] bg-white px-3 py-2 sm:w-80" />
        <label className="sr-only" htmlFor="author-filter">Filter by author</label>
        <select id="author-filter" value={authorId} onChange={(e) => { setAuthorId(e.target.value); setPage(1); }} className="rounded-md border border-[var(--border)] bg-white px-3 py-2">
          <option value="">All authors</option>
          {AUTHORS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="sort">Sort quotes</label>
        <select id="sort" value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }} className="rounded-md border border-[var(--border)] bg-white px-3 py-2">
          <option value="newest">Newest</option>
          <option value="most-liked">Most liked</option>
          <option value="most-favorited">Most favourited</option>
        </select>
        <button type="button" onClick={() => { setQ(""); setTopic(""); setAuthorId(""); setSort("newest"); setPage(1); }} className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm">Clear filters</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setTopic(""); setPage(1); }} className={`rounded-full px-3 py-1.5 text-sm ${topic === "" ? "bg-[var(--primary)] text-white" : "bg-white"}`}>All topics</button>
        {TOPICS.map((t) => (
          <button key={t.slug} type="button" onClick={() => { setTopic(t.slug); setPage(1); }} className={`rounded-full px-3 py-1.5 text-sm capitalize ${topic === t.slug ? "bg-[var(--primary)] text-white" : "bg-white"}`}>{t.name}</button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6 text-center">
          <p className="font-medium">No quotes match those filters.</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Try a different search, author, or topic — or clear the filters.</p>
          <button type="button" onClick={() => { setQ(""); setTopic(""); setAuthorId(""); setSort("newest"); setPage(1); }} className="mt-3 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Clear filters</button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((quote) => <QuoteCard key={quote.id} quote={quote} likeCount={realCounts[quote.id]?.likeCount ?? 0} />)}
        </div>
      )}
      <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
        <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm disabled:opacity-50">Previous</button>
        <span className="text-sm">Page {safePage} of {pages}</span>
        <button type="button" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)} className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm disabled:opacity-50">Next</button>
      </nav>
    </div>
  );
}

export default function QuotesPage() {
  return <Suspense><QuotesInner /></Suspense>;
}
