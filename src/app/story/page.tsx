"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QUOTES, getAuthor } from "@/lib/data";
import CopyButton from "@/components/CopyButton";
import { getLocalLiked, toggleLike } from "@/lib/likes";
import { isFavourite, toggleFavourite } from "@/lib/favorites";

export default function StoryPage() {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [fav, setFav] = useState(false);
  const quote = useMemo(() => QUOTES[index % QUOTES.length], [index]);
  const author = getAuthor(quote.authorId);
  const go = useCallback((dir: number) => setIndex((i) => (i + dir + QUOTES.length) % QUOTES.length), []);
  const shuffle = useCallback(() => setIndex(Math.floor(Math.random() * QUOTES.length)), []);

  useEffect(() => {
    setLiked(getLocalLiked("quote", quote.id));
    setFav(isFavourite(quote.id));
  }, [quote.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Story View · {index + 1} / {QUOTES.length}</p>
      <blockquote key={quote.id} className="mt-6 font-serif text-3xl leading-snug md:text-5xl">“{quote.text}”</blockquote>
      <p className="mt-4 text-[var(--muted-foreground)]">— {author?.name} · {quote.source}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => go(-1)} className="rounded-md border border-[var(--border)] bg-white px-4 py-2">← Previous</button>
        <CopyButton text={`"${quote.text}" — ${author?.name ?? ""}`} label="Copy" />
        <button type="button" onClick={async () => { const { liked: next } = await toggleLike("quote", quote.id); setLiked(next); }} aria-pressed={liked} className="rounded-md border border-[var(--border)] bg-white px-4 py-2">{liked ? "♥ Liked" : "♡ Like"}</button>
        <button type="button" onClick={async () => setFav(await toggleFavourite(quote.id))} aria-pressed={fav} className="rounded-md border border-[var(--border)] bg-white px-4 py-2">{fav ? "★ Saved" : "☆ Save"}</button>
        <button type="button" onClick={shuffle} className="rounded-md border border-[var(--border)] bg-white px-4 py-2">Shuffle</button>
        <Link href={`/quotes/${quote.id}`} className="rounded-md bg-[var(--primary)] px-4 py-2 text-white">Open quote</Link>
        <button type="button" onClick={() => go(1)} className="rounded-md border border-[var(--border)] bg-white px-4 py-2">Next →</button>
      </div>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">Keyboard: ← / → to move through quotes.</p>
    </div>
  );
}
