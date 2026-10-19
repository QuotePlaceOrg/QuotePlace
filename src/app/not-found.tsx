import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-serif text-6xl text-[var(--primary)]" aria-hidden="true">404</p>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">That page does not exist, or it moved. Try the library instead.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">Home</Link>
        <Link href="/quotes" className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm">All quotes</Link>
        <Link href="/authors" className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm">Authors</Link>
      </div>
    </div>
  );
}
