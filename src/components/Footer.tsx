import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--muted)]/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-bold">StoicBare</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">A bare, focused collection of public-domain wisdom. No ads, no distractions — just words that have shaped thought for thousands of years.</p>
        </div>
        <nav aria-label="Quick links">
          <p className="font-medium">Quick links</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/quotes" className="hover:underline">Quotes</Link></li>
            <li><Link href="/topics" className="hover:underline">Topics</Link></li>
          </ul>
        </nav>
        <nav aria-label="Help">
          <p className="font-medium">Help</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/about" className="hover:underline">About</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs">© {new Date().getFullYear()} StoicBare. All quotes are public domain.</div>
    </footer>
  );
}
