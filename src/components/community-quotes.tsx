"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  type DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import {
  ArrowRight,
  Check,
  Feather,
  LoaderCircle,
  LogIn,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";

const TOPICS = [
  "wisdom",
  "virtue",
  "discipline",
  "resilience",
  "courage",
  "self-knowledge",
  "fate",
  "time",
  "death",
  "anger",
];

const AUTHORS = [
  { label: "Marcus Aurelius", value: "marcus-aurelius" },
  { label: "Seneca", value: "seneca" },
  { label: "Epictetus", value: "epictetus" },
  { label: "Musonius Rufus", value: "musonius-rufus" },
  { label: "Cleanthes", value: "cleanthes" },
  { label: "Zeno of Citium", value: "zeno-of-citium" },
];

type PublicQuote = {
  id: string;
  text: string;
  authorName: string;
  authorSlug: string;
  source?: string;
  topics: string[];
};

function friendlyError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password combination was not recognised.";
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before finishing.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Authentication yet.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "Firebase denied this request. Check that Firestore is enabled and the StoicBare security rules have been deployed.";
    default:
      return (error as { message?: string })?.message || "Something went wrong. Please try again.";
  }
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        aria-label={title}
        role="dialog"
        className="my-auto w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Feather className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

/**
 * The header's Contribute button dispatches a custom event. Keeping the
 * experience here avoids coupling the existing landing-page layout to auth.
 */
export function ContributionPortal() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [topics, setTopics] = useState<string[]>(["wisdom"]);
  const [authBusy, setAuthBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    const openPortal = () => {
      setOpen(true);
      setError("");
      setSuccess("");
    };
    window.addEventListener("stoicbare:contribute", openPortal);
    return () => {
      unsubscribe();
      window.removeEventListener("stoicbare:contribute", openPortal);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setError("");
    setSuccess("");
  }, []);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setAuthBusy(true);
    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
          setUser(credential.user);
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (authError) {
      setError(friendlyError(authError));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (authError) {
      setError(friendlyError(authError));
    } finally {
      setAuthBusy(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : current.length < 5
          ? [...current, topic]
          : current,
    );
  };

  const submitQuote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const cleanText = text.trim().replace(/\s+/g, " ");
    const cleanAuthor = author.trim();
    if (cleanText.length < 12) {
      setError("Add a little more of the quote before submitting.");
      return;
    }
    if (!cleanAuthor) {
      setError("Please include the quote's author, or enter “Unknown” if uncertain.");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitBusy(true);
    try {
      const normalizedText = normalizeSearch(cleanText);
      await addDoc(collection(db, "quoteSubmissions"), {
        text: cleanText,
        authorName: cleanAuthor,
        authorSlug: slugify(cleanAuthor),
        source: source.trim(),
        topics,
        normalizedText,
        status: "pending",
        schemaVersion: 1,
        submittedBy: user.uid,
        submittedByName: (user.displayName || "StoicBare community member").slice(0, 80),
        createdAt: serverTimestamp(),
      });
      setText("");
      setAuthor("");
      setSource("");
      setTopics(["wisdom"]);
      setSuccess("Your quote has been submitted for review. Thank you for helping preserve good words.");
    } catch (submitError) {
      setError(friendlyError(submitError));
    } finally {
      setSubmitBusy(false);
    }
  };

  if (!open) return null;

  if (!user) {
    return (
      <ModalShell
        title={mode === "signin" ? "Welcome back" : "Join the StoicBare community"}
        subtitle={
          mode === "signin"
            ? "Sign in to contribute a quote and help keep this collection thoughtful and well-sourced."
            : "Create an account to submit quotes for editorial review."
        }
        onClose={close}
      >
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === "signup" && (
            <label className="block text-sm font-medium">
              Display name
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                maxLength={80}
                className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:ring-2 focus:ring-ring"
                placeholder="How should we credit you?"
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
              className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:ring-2 focus:ring-ring"
              placeholder="At least 6 characters"
            />
          </label>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={authBusy}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {authBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {mode === "signin" ? "Sign in to contribute" : "Create account"}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={authBusy}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          <span aria-hidden="true" className="font-bold">G</span>
          Continue with Google
        </button>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to StoicBare?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          Contributions are reviewed before they appear in the public library.
        </p>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Contribute a quote"
      subtitle="Share a source-backed thought. New submissions stay private until reviewed."
      onClose={close}
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <UserRound className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{user.displayName || user.email}</span>
        </div>
        <button
          type="button"
          onClick={() => void signOut(auth)}
          className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </div>
      <form onSubmit={submitQuote} className="space-y-4">
        <label className="block text-sm font-medium">
          Quote <span className="text-destructive">*</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            minLength={12}
            maxLength={1200}
            required
            rows={4}
            className="mt-1.5 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 font-normal leading-6 outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Write or paste the exact words…"
          />
          <span className="mt-1 block text-right text-xs text-muted-foreground">{text.length}/1200</span>
        </label>
        <label className="block text-sm font-medium">
          Author <span className="text-destructive">*</span>
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
            maxLength={120}
            className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Who said or wrote it?"
          />
        </label>
        <label className="block text-sm font-medium">
          Source or citation
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            maxLength={240}
            className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Book, chapter, page, URL (if known)"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Topics (choose up to 5)</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const active = topics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTopic(topic)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition " +
                    (active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                  }
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </fieldset>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {success && (
          <p role="status" className="flex items-start gap-2 rounded-lg bg-emerald-900/10 px-3 py-3 text-sm text-emerald-800 dark:text-emerald-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </p>
        )}
        <button
          type="submit"
          disabled={submitBusy}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit for review
        </button>
        <p className="text-xs leading-5 text-muted-foreground">
          Please include a reliable source where possible. We do not publish an attribution as verified just because it appears elsewhere online.
        </p>
      </form>
    </ModalShell>
  );
}

const PAGE_SIZE = 12;

function getQuoteTokens(value: string): string[] {
  return normalizeSearch(value).split(/\s+/).filter(Boolean);
}

/**
 * Firestore-backed public archive. Pagination is cursor-based rather than
 * loading the whole collection, so the UI remains usable with 100,000+ docs.
 */
export function LiveQuoteLibrary() {
  const [quotes, setQuotes] = useState<PublicQuote[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const requestRef = useRef(0);

  const loadPage = useCallback(async (reset: boolean) => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError("");
    if (reset) {
      cursorRef.current = null;
      setQuotes([]);
      setHasMore(false);
    }
    try {
      const constraints: QueryConstraint[] = [where("status", "==", "published")];
      if (selectedTopic) constraints.push(where("topics", "array-contains", selectedTopic));
      if (selectedAuthor) constraints.push(where("authorSlug", "==", selectedAuthor));
      const searchTokens = getQuoteTokens(searchTerm);
      if (searchTokens.length) {
        constraints.push(where("searchTokens", "array-contains", searchTokens[0]));
      }
      constraints.push(orderBy("publishedAt", "desc"));
      if (!reset && cursorRef.current) constraints.push(startAfter(cursorRef.current));
      constraints.push(limit(PAGE_SIZE));

      const snapshot = await getDocs(query(collection(db, "quotes"), ...constraints));
      if (requestId !== requestRef.current) return;
      const results: PublicQuote[] = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          text: typeof data.text === "string" ? data.text : "",
          authorName: typeof data.authorName === "string" ? data.authorName : "Unknown",
          authorSlug: typeof data.authorSlug === "string" ? data.authorSlug : "",
          source: typeof data.source === "string" ? data.source : "",
          topics: Array.isArray(data.topics) ? data.topics.filter((value: unknown) => typeof value === "string") : [],
        };
      });
      cursorRef.current = snapshot.docs.length
        ? snapshot.docs[snapshot.docs.length - 1]
        : cursorRef.current;
      setQuotes((current) => reset ? results : [...current, ...results]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (loadError) {
      if (requestId === requestRef.current) {
        setError(friendlyError(loadError));
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [selectedTopic, selectedAuthor, searchTerm]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onLandingSearch = (event: Event) => {
      const value = String((event as CustomEvent<string>).detail || "");
      setSearchInput(value);
      setSelectedTopic("");
      setSelectedAuthor("");
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setSearchTerm(value.trim()), 450);
    };
    window.addEventListener("stoicbare:search", onLandingSearch);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("stoicbare:search", onLandingSearch);
    };
  }, []);

  useEffect(() => {
    void loadPage(true);
  }, [loadPage]);

  const visibleQuotes = quotes.filter((quote) => {
    if (!searchTerm.trim()) return true;
    const haystack = normalizeSearch(
      [quote.text, quote.authorName, quote.source, ...quote.topics].join(" "),
    );
    return getQuoteTokens(searchTerm).every((token) => haystack.includes(token));
  });

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setSelectedTopic("");
    setSelectedAuthor("");
  };

  const copyQuote = async (quote: PublicQuote) => {
    const value = "“" + quote.text + "” — " + quote.authorName;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };

  return (
    <section id="community-library" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-18">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">The growing archive</p>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">More words to return to.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Browse the published community library, one carefully loaded page at a time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Designed for 100,000+ quotes
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSelectedTopic("");
            setSelectedAuthor("");
            setSearchTerm(searchInput.trim());
          }}
          className="mb-5 flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search quotes, authors, sources, or topics…"
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              aria-label="Search the published quote archive"
            />
          </div>
          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Search <ArrowRight className="h-4 w-4" />
          </button>
          {(searchTerm || selectedTopic || selectedAuthor) && (
            <button type="button" onClick={resetFilters} className="h-11 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted">
              Clear
            </button>
          )}
        </form>

        <div className="mb-7 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topics</span>
          {TOPICS.slice(0, 8).map((topic) => (
            <button
              key={topic}
              type="button"
              aria-pressed={selectedTopic === topic}
              onClick={() => {
                setSearchInput("");
                setSearchTerm("");
                setSelectedAuthor("");
                setSelectedTopic(selectedTopic === topic ? "" : topic);
              }}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition " +
                (selectedTopic === topic
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary")
              }
            >
              {topic}
            </button>
          ))}
          <select
            aria-label="Filter by author"
            value={selectedAuthor}
            onChange={(event) => {
              setSearchInput("");
              setSearchTerm("");
              setSelectedTopic("");
              setSelectedAuthor(event.target.value);
            }}
            className="ml-0 h-8 rounded-full border border-border bg-card px-3 text-xs text-muted-foreground outline-none focus:ring-2 focus:ring-ring sm:ml-auto"
          >
            <option value="">All authors</option>
            {AUTHORS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <p className="font-semibold">The quote archive could not be loaded.</p>
            <p className="mt-1 leading-6">{error}</p>
            <p className="mt-1 text-xs">Confirm that Firestore is enabled, security rules and indexes are deployed, and published quote records have been imported.</p>
          </div>
        )}

        {loading && quotes.length === 0 && (
          <div className="flex min-h-36 items-center justify-center gap-3 text-sm text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            Opening the archive…
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Feather className="h-5 w-5" /></div>
            <h3 className="font-serif text-xl font-semibold">The public archive is ready for its first collection.</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Published quotes will appear here after a reviewed dataset is imported into Firestore. Community submissions remain private while they are reviewed.
            </p>
          </div>
        )}

        {quotes.length > 0 && visibleQuotes.length === 0 && !loading && (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No loaded quotes match every search term. Try fewer words or load the next page.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleQuotes.map((quote) => (
            <article key={quote.id} className="flex min-h-56 flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <span aria-hidden="true" className="stoic-mark mb-2 text-4xl">“</span>
              <blockquote className="stoic-quote-text mb-5 flex-1 text-lg">{quote.text}</blockquote>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-primary">{quote.authorName}</p>
                {quote.source && <p className="mt-1 text-xs italic text-muted-foreground">{quote.source}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {quote.topics.slice(0, 3).map((topic) => <span key={topic} className="rounded-full bg-muted px-2 py-1 text-[10px] capitalize text-muted-foreground">{topic}</span>)}
                </div>
                <button
                  type="button"
                  onClick={() => void copyQuote(quote)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
                >
                  Copy quote <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {loading && quotes.length > 0 && (
          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading more quotes…
          </div>
        )}
        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => void loadPage(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold transition hover:border-primary hover:text-primary"
            >
              Load more quotes <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {!hasMore && quotes.length > 0 && !loading && (
          <p className="mt-8 text-center text-xs text-muted-foreground">You’re up to date with this query.</p>
        )}
        <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
          Search is indexed by word and prefix. For unrestricted phrase and typo-tolerant search across a large corpus, connect a dedicated search service such as Algolia.
        </p>
      </div>
    </section>
  );
}
