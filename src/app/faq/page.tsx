const FAQS = [
  { q: "What is StoicBare?", a: "StoicBare is a focused library of short public-domain quotes from long-dead thinkers, organised by author and topic. It is designed to be fast, calm, and easy to browse." },
  { q: "Where do the quotes come from?", a: "From public-domain texts and widely-attributed sayings of ancient thinkers — for example the Meditations, the Analects, the Tao Te Ching, and the plays of Shakespeare. We show the source for each quote." },
  { q: "How can I contribute?", a: "Use the Contribute page to suggest a quote with its author and source. A reviewer checks attribution before anything is published. Please do not submit modern copyrighted text." },
  { q: "How are quotes verified?", a: "We check the author, the work it comes from, and whether the wording matches a known public-domain version. Quotes that cannot be verified are not published." },
  { q: "Can I use quotes in my work?", a: "These are short public-domain sayings. You may use them with attribution to the author. For longer passages, check the source edition you are quoting from." },
  { q: "Do I need an account?", a: "No. You can browse, search, and read everything without an account. An account lets you save favourites across devices and track your contributions." },
  { q: "Is StoicBare free?", a: "Yes. The library is free to read. There are no ads in the current design." },
];
export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Answers to common questions about StoicBare.</p>
      <div className="mt-6 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
