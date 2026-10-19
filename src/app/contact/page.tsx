"use client";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Questions about a quote, a correction, or a contribution? Write to us and we will get back to you.</p>
      <p className="mt-3 text-sm">You can also email us directly at <a href="mailto:stoicbare@gmail.com" className="text-[var(--primary)] hover:underline">stoicbare@gmail.com</a>.</p>
      {done ? (
        <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6" role="status">Thanks — your email app should have opened with the message addressed to stoicbare@gmail.com. If it didn&apos;t, email us directly at stoicbare@gmail.com.</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) { setError("Name is required."); return; }
          if (!email.includes("@")) { setError("A valid email is required."); return; }
          if (message.trim().length < 10) { setError("Message must be at least 10 characters."); return; }
          setError("");
          const subject = encodeURIComponent(`StoicBare contact from ${name.trim()}`);
          const body = encodeURIComponent(`Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`);
          window.location.href = `mailto:stoicbare@gmail.com?subject=${subject}&body=${body}`;
          setDone(true);
        }}>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <div><label htmlFor="ct-name" className="block text-sm font-medium">Name *</label><input id="ct-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="ct-email" className="block text-sm font-medium">Email *</label><input id="ct-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="ct-message" className="block text-sm font-medium">Message *</label><textarea id="ct-message" required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <button type="submit" className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-white">Send message</button>
        </form>
      )}
    </div>
  );
}
