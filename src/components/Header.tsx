"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/quotes", label: "Quotes" },
  { href: "/authors", label: "Authors" },
  { href: "/topics", label: "Topics" },
  { href: "/articles", label: "Articles" },
  { href: "/story", label: "Story" },
  { href: "/about", label: "About" },
];

function avatarInitial(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "");
}

export default function Header() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, profile, logOut } = useAuth();
  const displayName = profile?.displayName || user?.displayName || "Reader";
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-serif font-bold tracking-tight" aria-label="StoicBare home">
          Stoic<span className="text-[var(--primary)]">Bare</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex" aria-label="Primary">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:underline">{n.label}</Link>)}
        </nav>
        <form
          className="ml-auto hidden sm:flex"
          onSubmit={(e) => { e.preventDefault(); router.push(`/quotes?q=${encodeURIComponent(q)}`); }}
          role="search"
        >
          <label htmlFor="header-search" className="sr-only">Search quotes</label>
          <input id="header-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quotes…" className="rounded-l-md border border-[var(--border)] bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-r-md bg-[var(--primary)] px-3 py-2 text-sm text-white">Search</button>
        </form>
        <Link href="/contribute" className="hidden rounded-md border border-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary)] sm:inline-block">Contribute</Link>
        {user ? (
          <>
            <Link href="/profile" className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-white px-2 py-1.5 text-sm font-medium" aria-label="Open your profile">
              {profile?.photoURL || user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(profile?.photoURL || user.photoURL) ?? ""} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white" aria-hidden="true">{avatarInitial(displayName)}</span>
              )}
              <span className="max-w-[8rem] truncate">{displayName}</span>
            </Link>
            <button type="button" onClick={() => logOut()} className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white">Log out</button>
          </>
        ) : (
          <Link href="/login" className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white">Login</Link>
        )}
        <button type="button" className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm md:hidden" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>
      {open && (
        <nav className="border-t border-[var(--border)] px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-wrap gap-4 text-sm">
            {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>)}
            <Link href="/contribute" onClick={() => setOpen(false)}>Contribute</Link>
          </div>
          <form className="mt-3 flex" onSubmit={(e) => { e.preventDefault(); setOpen(false); router.push(`/quotes?q=${encodeURIComponent(q)}`); }} role="search">
            <label htmlFor="header-search-mobile" className="sr-only">Search quotes</label>
            <input id="header-search-mobile" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quotes…" className="w-full rounded-l-md border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <button type="submit" className="rounded-r-md bg-[var(--primary)] px-3 py-2 text-sm text-white">Search</button>
          </form>
        </nav>
      )}
    </header>
  );
}
