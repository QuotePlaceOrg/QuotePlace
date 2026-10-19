"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createSubmission } from "@/lib/db";

export default function ContributePage() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user, profile, configured } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quote.trim().length < 10) { setError("Quote must be at least 10 characters."); return; }
    if (!author.trim()) { setError("Author is required."); return; }
    if (!source.trim()) { setError("Source is required so we can verify it."); return; }
    setError(""); setBusy(true);
    try {
      if (user && configured) {
        await createSubmission(user.uid, profile?.displayName || user.displayName || "Reader", "quote", { text: quote.trim(), authorName: author.trim(), source: source.trim(), topic: topic.trim(), email: email.trim() });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save submission. It was validated locally.");
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contribute a Quote</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Suggest a public-domain quote. Include author and source so we can verify it. Modern copyrighted text will not be published.</p>
      {!user && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm">Sign in to have your submission saved to Firestore with your account. Guests can still validate the form. <Link href="/login" className="text-[var(--primary)] hover:underline">Log in</Link></p>}
      {done ? (
        <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6" role="status">Thanks! Your suggestion was saved for review{user ? "" : " (preview — sign in to save it to the database)"}. Every submission is reviewed before publishing.</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <div><label htmlFor="c-quote" className="block text-sm font-medium">Quote *</label><textarea id="c-quote" required value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="c-author" className="block text-sm font-medium">Author *</label><input id="c-author" required value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="c-source" className="block text-sm font-medium">Source / work *</label><input id="c-source" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Meditations, Book 4" className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="c-topic" className="block text-sm font-medium">Topic</label><input id="c-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. wisdom" className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="c-email" className="block text-sm font-medium">Your email (optional)</label><input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <button type="submit" disabled={busy} className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-white disabled:opacity-50">{busy ? "Saving…" : "Submit for review"}</button>
        </form>
      )}
    </div>
  );
}
