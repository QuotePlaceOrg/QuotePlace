"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  type DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
  writeBatch,
} from "firebase/firestore";
import {
  Check,
  CircleAlert,
  ExternalLink,
  LoaderCircle,
  LogIn,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";

type Submission = {
  id: string;
  kind: "community" | "imported";
  text: string;
  authorName: string;
  authorSlug: string;
  source: string;
  topics: string[];
  submittedByName: string;
  submittedBy: string;
  license: string;
  status: string;
  createdAt?: { toDate?: () => Date; toMillis?: () => number };
};

function normalizeSearch(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalizeSearch(value).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

function searchTokens(values: string[]): string[] {
  const tokens = new Set<string>();
  for (const value of values) {
    for (const word of normalizeSearch(value).split(/\s+/).filter(Boolean)) {
      if (word.length < 2) continue;
      tokens.add(word);
      if (word.length >= 3) {
        for (let size = 3; size <= Math.min(word.length, 12); size += 1) {
          tokens.add(word.slice(0, size));
        }
      }
      if (tokens.size >= 180) return [...tokens];
    }
  }
  return [...tokens];
}

async function quoteDocumentId(authorSlug: string, text: string): Promise<string> {
  const input = new TextEncoder().encode(authorSlug + "\n" + normalizeSearch(text));
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function AdminReview() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [licenses, setLicenses] = useState<Record<string, string>>({});
  const [rightsConfirmed, setRightsConfirmed] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    setChecking(true);
    setError("");
    if (!currentUser) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    try {
      const token = await currentUser.getIdTokenResult(true);
      setIsAdmin(token.claims.admin === true);
    } catch (tokenError) {
      setError((tokenError as { message?: string })?.message || "Could not verify admin access.");
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      void checkAdmin(currentUser);
    });
  }, [checkAdmin]);

  const loadSubmissions = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const communityQuery = query(
        collection(db, "quoteSubmissions"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc"),
        limit(50),
      );
      const importedQuery = query(
        collection(db, "quotes"),
        where("status", "==", "pending_review"),
        orderBy("createdAt", "desc"),
        limit(50),
      );
      const [communitySnapshot, importedSnapshot] = await Promise.all([
        getDocs(communityQuery),
        getDocs(importedQuery),
      ]);
      const communityItems: Submission[] = communitySnapshot.docs.map((item) => {
        const value: DocumentData = item.data();
        return {
          id: item.id,
          kind: "community",
          text: typeof value.text === "string" ? value.text : "",
          authorName: typeof value.authorName === "string" ? value.authorName : "Unknown",
          authorSlug: typeof value.authorSlug === "string" ? value.authorSlug : "",
          source: typeof value.source === "string" ? value.source : "",
          topics: Array.isArray(value.topics) ? value.topics.filter((x: unknown) => typeof x === "string") : [],
          submittedByName: typeof value.submittedByName === "string" ? value.submittedByName : "Community member",
          submittedBy: typeof value.submittedBy === "string" ? value.submittedBy : "",
          license: typeof value.license === "string" ? value.license : "",
          status: typeof value.status === "string" ? value.status : "pending",
          createdAt: value.createdAt,
        };
      });
      const importedItems: Submission[] = importedSnapshot.docs.map((item) => {
        const value: DocumentData = item.data();
        return {
          id: item.id,
          kind: "imported",
          text: typeof value.text === "string" ? value.text : "",
          authorName: typeof value.authorName === "string" ? value.authorName : "Unknown",
          authorSlug: typeof value.authorSlug === "string" ? value.authorSlug : "",
          source: typeof value.source === "string" ? value.source : "",
          topics: Array.isArray(value.topics) ? value.topics.filter((x: unknown) => typeof x === "string") : [],
          submittedByName: "Bulk-imported dataset",
          submittedBy: "",
          license: typeof value.license === "string" ? value.license : "",
          status: typeof value.status === "string" ? value.status : "pending_review",
          createdAt: value.createdAt,
        };
      });
      const timestamp = (item: Submission) => item.createdAt?.toMillis?.() ?? 0;
      setSubmissions(
        [...communityItems, ...importedItems]
          .sort((left, right) => timestamp(right) - timestamp(left))
          .slice(0, 50),
      );
    } catch (loadError) {
      setError((loadError as { message?: string })?.message || "Could not load submissions. Check Firestore rules and indexes.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) void loadSubmissions();
  }, [isAdmin, loadSubmissions]);

  const approve = async (submission: Submission) => {
    if (!user || !isAdmin) return;
    const license = (licenses[submission.id] || "").trim();
    if (!license) {
      setError("Add the source's rights basis or license before publishing this quote.");
      return;
    }
    if (!rightsConfirmed[submission.id]) {
      setError("Confirm that the quote attribution and publication rights have been checked.");
      return;
    }

    setBusyId(submission.id);
    setError("");
    setNotice("");
    try {
      const authorSlug = slugify(submission.authorName);
      const quoteId = submission.kind === "imported"
        ? submission.id
        : await quoteDocumentId(authorSlug, submission.text);
      const quoteRef = doc(db, "quotes", quoteId);
      const batch = writeBatch(db);
      const topics = submission.topics.slice(0, 8);

      if (submission.kind === "imported") {
        batch.update(quoteRef, {
          authorSlug,
          license,
          attributionStatus: "reviewed",
          status: "published",
          updatedAt: serverTimestamp(),
          publishedAt: serverTimestamp(),
          reviewedBy: user.uid,
          reviewedAt: serverTimestamp(),
        });
      } else {
        const submissionRef = doc(db, "quoteSubmissions", submission.id);
        batch.set(quoteRef, {
          text: submission.text,
          authorName: submission.authorName,
          authorSlug,
          source: submission.source,
          sourceUrl: "",
          topics,
          language: "en",
          license,
          attributionStatus: "reviewed",
          status: "published",
          contentHash: quoteId,
          normalizedText: normalizeSearch(submission.text),
          searchTokens: searchTokens([submission.text, submission.authorName, submission.source, ...topics]),
          schemaVersion: 1,
          createdAt: submission.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
          publishedAt: serverTimestamp(),
          reviewedBy: user.uid,
          reviewedAt: serverTimestamp(),
        }, { merge: true });
        batch.update(submissionRef, {
          status: "approved",
          publishedQuoteId: quoteId,
          reviewedBy: user.uid,
          reviewedAt: serverTimestamp(),
          reviewLicense: license,
        });
      }
      await batch.commit();
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setNotice("Quote published: “" + submission.text.slice(0, 100) + (submission.text.length > 100 ? "…”" : "”"));
      setLicenses((current) => {
        const next = { ...current };
        delete next[submission.id];
        return next;
      });
      setRightsConfirmed((current) => {
        const next = { ...current };
        delete next[submission.id];
        return next;
      });
    } catch (approvalError) {
      setError((approvalError as { message?: string })?.message || "Publishing failed.");
    } finally {
      setBusyId("");
    }
  };

  const reject = async (submission: Submission) => {
    if (!user || !isAdmin) return;
    setBusyId(submission.id);
    setError("");
    setNotice("");
    try {
      const collectionName = submission.kind === "imported" ? "quotes" : "quoteSubmissions";
      await updateDoc(doc(db, collectionName, submission.id), {
        status: "rejected",
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
      });
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setNotice("Submission rejected and removed from the review queue.");
    } catch (rejectError) {
      setError((rejectError as { message?: string })?.message || "Could not reject this submission.");
    } finally {
      setBusyId("");
    }
  };

  if (checking) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center gap-3 px-4 text-sm text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" /> Checking reviewer access…
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16">
        <section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
          <h1 className="font-serif text-3xl font-semibold">Editorial review</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            This area is restricted to trusted StoicBare editors. Sign in and make sure your Firebase user has the admin custom claim.
          </p>
          {!user && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("stoicbare:contribute"))}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          )}
          {user && (
            <div className="mt-6 rounded-xl bg-muted/60 p-4 text-left">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">This user does not currently have the admin claim.</p>
              <button
                type="button"
                onClick={() => void checkAdmin(user)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <RefreshCw className="h-4 w-4" /> Refresh permissions
              </button>
            </div>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <a href="/" className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">Return to StoicBare <ExternalLink className="h-3.5 w-3.5" /></a>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">StoicBare editors</p>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Quote review queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review attribution and rights before publishing. {submissions.length} pending in this page.</p>
        </div>
        <button type="button" onClick={() => void loadSubmissions()} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:border-primary disabled:opacity-60">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh queue
        </button>
      </div>

      {error && <p role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-900/20 bg-emerald-900/5 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p>}

      {loading && submissions.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading pending submissions…</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <Check className="mx-auto mb-3 h-7 w-7 text-primary" />
          <h2 className="font-serif text-xl font-semibold">The queue is clear.</h2>
          <p className="mt-2 text-sm text-muted-foreground">New community submissions will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/10 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300"><CircleAlert className="h-3.5 w-3.5" /> {submission.kind === "imported" ? "Imported · pending review" : "Community submission"}</span>
                <span className="text-xs text-muted-foreground">{submission.kind === "imported" ? submission.submittedByName : "Submitted by " + submission.submittedByName}{submission.createdAt?.toDate ? " · " + submission.createdAt.toDate().toLocaleDateString() : ""}</span>
              </div>
              <blockquote className="stoic-quote-text text-xl leading-relaxed sm:text-2xl">“{submission.text}”</blockquote>
              <p className="mt-4 text-sm font-semibold text-primary">— {submission.authorName}</p>
              {submission.source && <p className="mt-1 text-sm italic text-muted-foreground">{submission.source}</p>}
              {submission.topics.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{submission.topics.map((topic) => <span key={topic} className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">{topic}</span>)}</div>}

              <div className="mt-6 grid gap-4 border-t border-border pt-5">
                <label className="block text-sm font-medium">
                  Rights basis / license <span className="text-destructive">*</span>
                  <input
                    value={licenses[submission.id] || ""}
                    onChange={(event) => setLicenses((current) => ({ ...current, [submission.id]: event.target.value }))}
                    maxLength={100}
                    placeholder="e.g. public domain, CC0-1.0, permission granted"
                    className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none transition focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(rightsConfirmed[submission.id])}
                    onChange={(event) => setRightsConfirmed((current) => ({ ...current, [submission.id]: event.target.checked }))}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>I checked the wording, attribution, source, and legal basis for publishing this quote.</span>
                </label>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void reject(submission)}
                  disabled={busyId === submission.id}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-destructive/40 hover:text-destructive disabled:opacity-60"
                >
                  {busyId === submission.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Reject
                </button>
                <button
                  type="button"
                  onClick={() => void approve(submission)}
                  disabled={busyId === submission.id || !licenses[submission.id]?.trim() || !rightsConfirmed[submission.id]}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyId === submission.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve & publish
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-8 text-xs leading-5 text-muted-foreground">
        Showing up to 50 pending submissions. This page is only a user interface; Firestore security rules and the Firebase admin custom claim enforce authorization.
      </p>
    </main>
  );
}
