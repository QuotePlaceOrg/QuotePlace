"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Quote } from "@/lib/data";
import { getAuthor } from "@/lib/data";
import { isFavourite, toggleFavourite } from "@/lib/favorites";
import { getLocalLiked, toggleLike } from "@/lib/likes";
import CopyButton from "./CopyButton";

export default function QuoteCard({ quote, likeCount: likeCountProp }: { quote: Quote; likeCount?: number }) {
  const author = getAuthor(quote.authorId);
  const [fav, setFav] = useState(false);
  const [liked, setLiked] = useState(false);
  // Count comes ONLY from the Firestore-backed likeCount prop (or 0). Never local.
  const [likeCount, setLikeCount] = useState(likeCountProp ?? 0);
  useEffect(() => {
    setFav(isFavourite(quote.id));
    setLiked(getLocalLiked("quote", quote.id));
    setLikeCount(likeCountProp ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.id, likeCountProp]);
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
        <CopyButton text={`"${quote.text}" — ${author?.name ?? ""}`} label="Copy" />
        <Link href={`/quotes/${quote.id}`} className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs">Read more</Link>
        <button
          type="button"
          onClick={async () => { const { liked: next, persisted } = await toggleLike("quote", quote.id); setLiked(next); if (persisted) setLikeCount((c) => Math.max(0, c + (next ? 1 : -1))); }}
          aria-pressed={liked}
          className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs"
        >
          {liked ? "♥" : "♡"} {likeCount}
        </button>
        <button
          type="button"
          onClick={async () => setFav(await toggleFavourite(quote.id))}
          aria-pressed={fav}
          className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs"
        >
          {fav ? "★ Saved" : "☆ Save"}
        </button>
      </div>
      <span className="sr-only">Likes: {likeCount}</span>
    </article>
  );
}
