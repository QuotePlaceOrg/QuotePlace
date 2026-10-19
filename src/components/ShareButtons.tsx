"use client";
import CopyButton from "./CopyButton";
export default function ShareButtons({ text, url }: { text: string; url: string }) {
  const full = typeof window !== "undefined" ? window.location.origin + url : url;
  const encText = encodeURIComponent(text);
  const encUrl = encodeURIComponent(full);
  return (
    <div className="flex flex-wrap gap-2" aria-label="Share this quote">
      <a href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs">X / Twitter</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs">Facebook</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs">LinkedIn</a>
      <CopyButton text={text} label="Copy quote" />
    </div>
  );
}
