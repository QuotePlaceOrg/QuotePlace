"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BlogDoc } from "@/lib/types";
import { getLocalLiked, toggleLike } from "@/lib/likes";

export default function BlogCard({ post }: { post: BlogDoc }) {
  const [liked, setLiked] = useState(false);
  // Count comes ONLY from post.likeCount (Firestore/seed). Never local.
  const [likeCount, setLikeCount] = useState(post.likeCount);
  useEffect(() => {
    setLiked(getLocalLiked("blog", post.id));
    setLikeCount(post.likeCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, post.likeCount]);
  return (
    <article className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <p className="text-xs text-[var(--muted-foreground)]">
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""} · {post.readMinutes} min read · {post.viewCount} views
      </p>
      <h3 className="mt-2 font-serif text-xl font-bold leading-snug">
        <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-[var(--muted-foreground)]">{post.excerpt}</p>
      <p className="mt-3 text-sm">By {post.authorName}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {post.tags.map((t) => (
          <span key={t} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">{t}</span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/blog/${post.slug}`} className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs">Read article</Link>
        <button type="button" onClick={async () => { const { liked: next, persisted } = await toggleLike("blog", post.id); setLiked(next); if (persisted) setLikeCount((c) => Math.max(0, c + (next ? 1 : -1))); }} aria-pressed={liked} className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs">
          {liked ? "♥" : "♡"} {likeCount}
        </button>
      </div>
    </article>
  );
}
