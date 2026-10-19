"use client";
import { useState } from "react";
export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { setDone(false); } }}
      className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium"
      aria-live="polite"
    >
      {done ? "Copied!" : label}
    </button>
  );
}
