import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t-[3px] border-t-[var(--primary)] bg-[var(--foreground)] text-[var(--background)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="flex items-center gap-2 text-lg font-black tracking-[0.08em]">
            <span aria-hidden="true" className="inline-block h-3 w-3 rotate-45 bg-[#B87333]" />
            Quote Place
          </p>
          <p className="mt-2 text-sm opacity-70">Words worth passing on.</p>
        </div>
        <nav aria-label="Browse">
          <p className="eyebrow !text-[var(--background)] opacity-70">Browse</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/quotes" className="hover:underline">Quotes</Link></li>
            <li><Link href="/topics" className="hover:underline">Topics</Link></li>
            <li><Link href="/" className="hover:underline">Today&apos;s quote</Link></li>
          </ul>
        </nav>
        <nav aria-label="Help">
          <p className="eyebrow !text-[var(--background)] opacity-70">Help</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/about" className="hover:underline">About</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs opacity-70">© {new Date().getFullYear()} Quote Place. All quotes are public domain or used with attribution.</div>
    </footer>
  );
}
