"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signUp, signInWithGoogle, configured } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setBusy(true);
    try { await signUp(name, email, password); router.push("/profile"); }
    catch (err) { setError(err instanceof Error ? err.message : "Sign-up failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">Save favourites across devices.</p>
      {!configured && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm" role="note">Firebase is not configured yet — sign-up will fail until .env.local is set. See DATABASE.md.</p>}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <button type="button" disabled={busy} onClick={async () => { setError(""); setBusy(true); try { await signInWithGoogle(); router.push("/profile"); } catch (err) { setError(err instanceof Error ? err.message : "Sign-up failed."); } finally { setBusy(false); } }} className="w-full rounded-md border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-50">Continue with Google</button>
        <div className="my-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><span className="h-px flex-1 bg-[var(--border)]" />or with email<span className="h-px flex-1 bg-[var(--border)]" /></div>
        {error && <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm" role="alert">{error}</p>}
        <form className="space-y-3" onSubmit={onSubmit}>
          <div><label htmlFor="su-name" className="block text-sm font-medium">Name</label><input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="su-email" className="block text-sm font-medium">Email</label><input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="su-password" className="block text-sm font-medium">Password</label><input id="su-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2" /><p className="mt-1 text-xs text-[var(--muted-foreground)]">At least 8 characters.</p></div>
          <button type="submit" disabled={busy} className="w-full rounded-md bg-[var(--primary)] px-4 py-2.5 text-white disabled:opacity-50">{busy ? "Creating…" : "Create account"}</button>
        </form>
        <p className="mt-4 text-center text-sm">Already have an account? <Link href="/login" className="text-[var(--primary)] hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}
