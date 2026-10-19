"use client";
import { useState } from "react";
import { subscribeNewsletter } from "@/lib/db";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setError(""); setBusy(true);
    try { await subscribeNewsletter(email, "footer"); setDone(true); }
    catch { setError("Could not save — Firebase is not configured yet. You are on the local preview list."); setDone(true); }
    finally { setBusy(false); }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--primary)] p-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-widest">Join our community</p>
      <h2 className="mt-2 text-2xl font-bold">Get Weekly Wisdom Delivered</h2>
      <p className="mt-2 text-sm opacity-90">One powerful insight each week that you can actually apply. No spam, unsubscribe anytime.</p>
      {done ? (
        <p className="mt-4 rounded-md bg-white/20 px-4 py-3 text-sm" role="status">Thanks! You are on the list.{error ? ` (${error})` : " Saved to newsletter_subscribers."}</p>
      ) : (
        <form className="mt-4 flex max-w-md gap-2" onSubmit={onSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input id="newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-md px-3 py-2 text-black" />
          <button type="submit" disabled={busy} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50">{busy ? "Saving…" : "Subscribe"}</button>
        </form>
      )}
    </div>
  );
}
