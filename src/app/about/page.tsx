export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">About Quote Place</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">Quote Place is a focused library of public-domain quotes, made to be shared as images. It gathers short, time-tested sayings from thinkers, writers, and poets around the world — Stoic, romantic, funny, and plain-spoken.</p>
      <h2 className="mt-8 text-xl font-bold">What we believe</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--muted-foreground)]">
        <li>Less noise, more meaning. One clear quote beats a wall of decoration.</li>
        <li>Correct attribution matters. We show the author and source for every quote.</li>
        <li>Public domain only. We do not republish modern copyrighted work.</li>
        <li>Everyone should be able to find wisdom fast — by author, by topic, or by search.</li>
      </ul>
      <h2 className="mt-8 text-xl font-bold">How it works</h2>
      <p className="mt-3 text-[var(--muted-foreground)]">Browse quotes, save favourites, read a daily quote, or explore by topic. Every quote is checked against its public-domain source before it is published.</p>
    </div>
  );
}
