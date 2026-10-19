"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getLocalLiked, toggleLike } from "@/lib/likes";
import { isFavourite, toggleFavourite } from "@/lib/favorites";
import { createSubmission } from "@/lib/db";
import CopyButton from "./CopyButton";
import ShareButtons from "./ShareButtons";

export default function QuoteDetailActions({ quoteId, text, authorName, likeCount: likeCountProp }: { quoteId: string; text: string; authorName: string; likeCount?: number }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likeCountProp ?? 0);
  const [fav, setFav] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    setLiked(getLocalLiked("quote", quoteId));
    // Count comes ONLY from the Firestore-backed likeCount prop (or 0). Never local.
    setLikeCount(likeCountProp ?? 0);
    setFav(isFavourite(quoteId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, likeCountProp]);

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setReportError("Sign in to report a quote."); return; }
    if (!reportReason.trim()) { setReportError("Please say what is wrong."); return; }
    try {
      await createSubmission(user.uid, user.displayName || "Reader", "correction", { quoteId, reason: reportReason.trim(), text });
      setReportDone(true);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Could not send the report.");
    }
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2">
        <CopyButton text={`"${text}" — ${authorName}`} label="Copy quote" />
        <ShareButtons text={`"${text}" — ${authorName}`} url={`/quotes/${quoteId}`} />
        <button type="button" onClick={async () => { const { liked: next, persisted } = await toggleLike("quote", quoteId); setLiked(next); if (persisted) setLikeCount((c) => Math.max(0, c + (next ? 1 : -1))); }} aria-pressed={liked} className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">
          {liked ? "♥ Liked" : "♡ Like"} · {likeCount}
        </button>
        <button type="button" onClick={async () => setFav(await toggleFavourite(quoteId))} aria-pressed={fav} className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">
          {fav ? "★ Saved" : "☆ Save to favourites"}
        </button>
        <button type="button" onClick={() => setReportOpen((v) => !v)} className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm">Report</button>
      </div>
      {reportOpen && (
        <form onSubmit={submitReport} className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4">
          {reportDone ? (
            <p role="status" className="text-sm">Thanks — your report was sent for review.</p>
          ) : (
            <>
              <label htmlFor="report-reason" className="block text-sm font-medium">What is wrong with this quote?</label>
              <textarea id="report-reason" value={reportReason} onChange={(e) => setReportReason(e.target.value)} rows={2} placeholder="e.g. wrong author, wrong wording, not public domain…" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" />
              {reportError && <p role="alert" className="mt-2 text-sm text-red-700">{reportError}</p>}
              {!user && <p className="mt-2 text-sm text-[var(--muted-foreground)]">Reporting requires sign-in.</p>}
              <button type="submit" className="mt-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Send report</button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
