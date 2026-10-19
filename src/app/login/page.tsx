"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signInWithGoogle, signInWithEmail, configured } = useAuth();
  const router = useRouter();

  async function run(fn: () => Promise<void>) {
    setError(""); setBusy(true);
    try { await fn(); router.push("/profile"); }
    catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">Log in to save favourites and track contributions.</p>
      {!configured && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm" role="note">Firebase is not configured yet (no NEXT_PUBLIC_FIREBASE_* vars) — sign-in will fail until .env.local is set. See DATABASE.md.</p>}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <button type="button" disabled={busy} onClick={() => run(signInWithGoogle)} className="w-full rounded-md border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-50">Continue with Google</button>
        <div className="my-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><span className="h-px flex-1 bg-[var(--border)]" />or with email<span className="h-px flex-1 bg-[var(--border)]" /></div>
        {error && <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm" role="alert">{error}</p>}
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => signInWithEmail(email, password)); }}>
          <div><label htmlFor="login-email" className="block text-sm font-medium">Email</label><input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="login-password" className="block text-sm font-medium">Password</label><input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <button type="submit" disabled={busy} className="w-full rounded-md bg-[var(--primary)] px-4 py-2.5 text-white disabled:opacity-50">{busy ? "Signing in…" : "Log in"}</button>
        </form>
        <p className="mt-4 text-center text-sm">No account? <Link href="/signup" className="text-[var(--primary)] hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}
