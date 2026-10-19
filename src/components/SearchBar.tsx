"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push(`/quotes?q=${encodeURIComponent(q)}`); }} role="search" className="flex w-full max-w-xl">
      <label htmlFor="search" className="sr-only">Search quotes, authors, topics</label>
      <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quotes, authors, topics…" className="w-full rounded-l-md border border-[var(--border)] bg-white px-4 py-3" />
      <button type="submit" className="rounded-r-md bg-[var(--primary)] px-5 py-3 text-white">Search</button>
    </form>
  );
}
