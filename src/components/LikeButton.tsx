"use client";
import { useEffect, useState } from "react";
import { getLocalLiked, toggleLike } from "@/lib/likes";
import type { LikeTargetType } from "@/lib/types";

// Count comes ONLY from the Firestore-backed likeCount prop (or 0).
// The displayed count moves only when the Firestore transaction persisted.
export default function LikeButton({ targetType, targetId, label, likeCount: likeCountProp }: { targetType: LikeTargetType; targetId: string; label: string; likeCount?: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCountProp ?? 0);
  useEffect(() => {
    setLiked(getLocalLiked(targetType, targetId));
    setCount(likeCountProp ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId, likeCountProp]);
  return (
    <button
      type="button"
      onClick={async () => { const { liked: next, persisted } = await toggleLike(targetType, targetId); setLiked(next); if (persisted) setCount((c) => Math.max(0, c + (next ? 1 : -1))); }}
      aria-pressed={liked}
      className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
    >
      {liked ? "♥" : "♡"} {label} · {count}
    </button>
  );
}
