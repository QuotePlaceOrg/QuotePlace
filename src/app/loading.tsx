export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        ))}
      </div>
    </div>
  );
}
