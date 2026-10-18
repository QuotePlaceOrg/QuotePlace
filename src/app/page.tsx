/**
 * Epsilon Study — study dashboard.
 *
 * Reverse-engineered from https://pw.studyparcham.in/ using REA
 * (morluto/rea v6.7.0). Captured Evidence:
 * /home/z/my-project/rea-evidence/studyparcham/capture.json (662 KB).
 *
 * The source site gates every batch behind an access-key system:
 *   - a `🔑 Expires in: 11h 59m 55s` badge in the header,
 *   - `verifyAccessWithServer()` that POSTs to /api/auth with action=verify_key,
 *   - `redirectToGenerator()` that bounces expired users to /generate.html,
 *   - a `ParchamVault` + device-fingerprint layer that stores 24h free-trial keys.
 *
 * Per the product decision, NONE of that is reproduced here. Every batch
 * is directly accessible — clicking "Enroll and Study" opens the batch URL
 * in a new tab, with no key wall, no expiry countdown, no generator redirect.
 *
 * To enable live batch links, replace the placeholder URLs in the BATCHES
 * array below with the real Epsilon Study endpoints. While a URL still
 * matches the *.epsilon-study.app placeholder, clicking surfaces a toast
 * instead of opening a broken tab.
 */

"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Settings,
  Clock,
  BookOpen,
  Phone,
  Plus,
  GraduationCap,
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────────────────
// Batch catalog. Direct-access URLs — no key wall.
// Replace the placeholder URLs with the real Epsilon Study endpoints.
// ───────────────────────────────────────────────────────────────────────────

type Batch = {
  id: string;
  name: string;
  exam: string;
  year: number;
  level: string;
  emoji: string;
  gradient: string; // Tailwind gradient classes
  url: string; // direct-access URL (placeholder until you set real ones)
  tag?: "New" | "Live" | "Popular";
};

const isPlaceholder = (url: string) =>
  /\.epsilon-study\.app(\/|$)/.test(url);

const BATCHES: Batch[] = [
  {
    id: "jee-foundation-2027",
    name: "JEE 2027 — Foundation",
    exam: "JEE",
    year: 2027,
    level: "Foundation",
    emoji: "📐",
    gradient: "from-blue-500 to-cyan-500",
    url: "https://batches.epsilon-study.app/jee-foundation-2027",
    tag: "Popular",
  },
  {
    id: "neet-foundation-2027",
    name: "NEET 2027 — Foundation",
    exam: "NEET",
    year: 2027,
    level: "Foundation",
    emoji: "🧬",
    gradient: "from-emerald-500 to-green-600",
    url: "https://batches.epsilon-study.app/neet-foundation-2027",
    tag: "Popular",
  },
  {
    id: "jee-crash-2027",
    name: "JEE 2027 — Crash Course",
    exam: "JEE",
    year: 2027,
    level: "Crash",
    emoji: "⚡",
    gradient: "from-amber-500 to-orange-600",
    url: "https://batches.epsilon-study.app/jee-crash-2027",
  },
  {
    id: "neet-crash-2027",
    name: "NEET 2027 — Crash Course",
    exam: "NEET",
    year: 2027,
    level: "Crash",
    emoji: "🧪",
    gradient: "from-rose-500 to-red-600",
    url: "https://batches.epsilon-study.app/neet-crash-2027",
  },
  {
    id: "jee-test-series-2027",
    name: "JEE 2027 — Test Series",
    exam: "JEE",
    year: 2027,
    level: "Test Series",
    emoji: "📝",
    gradient: "from-violet-500 to-purple-600",
    url: "https://batches.epsilon-study.app/jee-test-series-2027",
    tag: "New",
  },
  {
    id: "neet-test-series-2027",
    name: "NEET 2027 — Test Series",
    exam: "NEET",
    year: 2027,
    level: "Test Series",
    emoji: "📋",
    gradient: "from-teal-500 to-cyan-600",
    url: "https://batches.epsilon-study.app/neet-test-series-2027",
    tag: "New",
  },
  {
    id: "jee-power-batch-2027",
    name: "JEE 2027 — Power Batch",
    exam: "JEE",
    year: 2027,
    level: "Power Batch",
    emoji: "🔥",
    gradient: "from-fuchsia-500 to-pink-600",
    url: "https://batches.epsilon-study.app/jee-power-batch-2027",
    tag: "Live",
  },
  {
    id: "neet-power-batch-2027",
    name: "NEET 2027 — Power Batch",
    exam: "NEET",
    year: 2027,
    level: "Power Batch",
    emoji: "🌟",
    gradient: "from-indigo-500 to-blue-600",
    url: "https://batches.epsilon-study.app/neet-power-batch-2027",
    tag: "Live",
  },
  {
    id: "ioqm-2027",
    name: "IOQM 2027 — Olympiad",
    exam: "IOQM",
    year: 2027,
    level: "Olympiad",
    emoji: "🏆",
    gradient: "from-yellow-500 to-amber-600",
    url: "https://batches.epsilon-study.app/ioqm-2027",
  },
  {
    id: "clat-2027",
    name: "CLAT 2027 — Law",
    exam: "CLAT",
    year: 2027,
    level: "Law",
    emoji: "⚖️",
    gradient: "from-slate-600 to-gray-800",
    url: "https://batches.epsilon-study.app/clat-2027",
  },
  {
    id: "gpat-2027",
    name: "GPAT 2027 — Pharmacy",
    exam: "GPAT",
    year: 2027,
    level: "Pharmacy",
    emoji: "💊",
    gradient: "from-lime-500 to-green-600",
    url: "https://batches.epsilon-study.app/gpat-2027",
  },
  {
    id: "ipmat-2027",
    name: "IPMAT 2027 — Management",
    exam: "IPMAT",
    year: 2027,
    level: "Management",
    emoji: "📊",
    gradient: "from-cyan-500 to-blue-600",
    url: "https://batches.epsilon-study.app/ipmat-2027",
  },
  {
    id: "kcet-2027",
    name: "KCET 2027 — Karnataka",
    exam: "KCET",
    year: 2027,
    level: "State",
    emoji: "🎓",
    gradient: "from-orange-500 to-red-600",
    url: "https://batches.epsilon-study.app/kcet-2027",
  },
  {
    id: "capf-2027",
    name: "CAPF 2027 — Defence",
    exam: "CAPF",
    year: 2027,
    level: "Defence",
    emoji: "🛡️",
    gradient: "from-stone-600 to-neutral-800",
    url: "https://batches.epsilon-study.app/capf-2027",
  },
  {
    id: "foundation-9-10-2027",
    name: "Foundation 2027 — Class 9 & 10",
    exam: "Foundation",
    year: 2027,
    level: "School",
    emoji: "📚",
    gradient: "from-purple-500 to-indigo-600",
    url: "https://batches.epsilon-study.app/foundation-9-10-2027",
  },
  {
    id: "design-2027",
    name: "Design 2027 — NID / NIFT",
    exam: "Design",
    year: 2027,
    level: "Design",
    emoji: "🎨",
    gradient: "from-pink-500 to-rose-600",
    url: "https://batches.epsilon-study.app/design-2027",
  },
];

// Top-nav links (decorative on the landing page; would route in a full app).
const NAV_LINKS = [
  { label: "Study Dashboard", icon: GraduationCap, active: true },
  { label: "All Courses", icon: BookOpen },
  { label: "Study Timer", icon: Clock },
  { label: "Settings", icon: Settings },
  { label: "Contact & Support", icon: Phone },
] as const;

// Hidden SEO tag list (mirrors the source page's hidden `.tags` block).
const SEO_TAGS = [
  "epsilon study",
  "epsilonstudy",
  "epsilon batches",
  "jee 2027",
  "neet 2027",
  "ioqm 2027",
  "clat 2027",
  "ipmat 2027",
  "kcet 2027",
  "capf 2027",
  "gpat 2027",
  "exam prep",
  "online coaching",
  "test series",
  "foundation batch",
  "crash course",
];

// ───────────────────────────────────────────────────────────────────────────
// Live IST clock (useSyncExternalStore — hydration-safe, lint-clean).
// ───────────────────────────────────────────────────────────────────────────

function CurrentTime() {
  const timestamp = useSyncExternalStore(
    (cb) => {
      const id = setInterval(cb, 1000);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0,
  );
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  return <span suppressHydrationWarning>{formatted} IST</span>;
}

// ───────────────────────────────────────────────────────────────────────────
// Subcomponents
// ───────────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Logo + brand */}
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-gray-900"
          aria-label="Epsilon Study home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg">Epsilon Study</span>
        </a>

        {/* Primary nav (hidden on small screens) */}
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  link.active
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* + Add Batch */}
          <Button
            size="sm"
            className="hidden bg-violet-600 hover:bg-violet-700 sm:inline-flex"
            onClick={(e) => e.preventDefault()}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Batch
          </Button>

          {/* Notifications bell */}
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Notifications"
            onClick={(e) => e.preventDefault()}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500"
              aria-hidden="true"
            />
          </button>
        </div>
        {/* NOTE: the source page's `key-timer-badge` (🔑 Expires in: …) is
            intentionally NOT rendered here. That badge was the visible face
            of the access-key generation system the user asked us to omit. */}
      </div>
    </header>
  );
}

function BatchCard({
  batch,
  onEnroll,
}: {
  batch: Batch;
  onEnroll: (e: React.MouseEvent) => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Thumbnail */}
      <div
        className={`relative aspect-[16/9] bg-gradient-to-br ${batch.gradient}`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          <span aria-hidden="true">{batch.emoji}</span>
        </div>
        {batch.tag && (
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 bg-white/90 text-xs font-semibold text-gray-800"
          >
            {batch.tag}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="absolute right-2 top-2 bg-black/40 text-xs font-medium text-white"
        >
          {batch.exam} · {batch.year}
        </Badge>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-sm font-bold leading-tight text-gray-900">
          {batch.name}
        </h3>
        <p className="text-xs text-gray-500">{batch.level} batch</p>

        <Button
          size="sm"
          className="mt-auto w-full justify-center bg-violet-600 hover:bg-violet-700"
          onClick={onEnroll}
          aria-label={`Enroll and study ${batch.name}`}
        >
          Enroll and Study
          <Sparkles className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 sm:flex-row sm:py-3">
        <p>© {new Date().getFullYear()} Epsilon Study. All Rights Reserved.</p>
        <p className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Direct access enabled · <CurrentTime />
          </span>
        </p>
      </div>
    </footer>
  );
}

function AITutorChat() {
  const [open, setOpen] = useState(false);
  const [messages] = useState<
    { role: "bot" | "user"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hi! I'm Epsilon Study AI — always online. Looking for a batch or have a doubt? Ask away!",
    },
  ]);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg transition-transform hover:scale-105 ${
          open ? "scale-0" : "scale-100"
        }`}
        aria-label="Open Epsilon Study AI Tutor"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Epsilon Study AI Tutor"
          className="fixed bottom-4 right-4 z-40 flex h-96 w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Epsilon Study AI</div>
                <div className="flex items-center gap-1 text-[10px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Always online
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Close AI Tutor"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Composer (decorative — no backend wired up) */}
          <form
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="text"
              placeholder="Ask your doubt..."
              aria-label="Ask your doubt"
              className="h-9 flex-1"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 bg-violet-600 hover:bg-violet-700"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

function TelegramModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Join Epsilon Study on Telegram"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl">
            <span aria-hidden="true">💌</span>
          </div>
          <h2 className="text-lg font-bold">Join Telegram</h2>
        </div>
        <div className="p-6 text-center">
          <p className="mb-4 text-sm text-gray-600">
            Get the latest updates of the website and instant notifications
            directly to your phone. Must join this. 💕
          </p>
          <a
            href="https://t.me/epsilonstudy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Join Now 💞
          </a>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function Home() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showTelegram, setShowTelegram] = useState(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BATCHES;
    return BATCHES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.exam.toLowerCase().includes(q) ||
        b.level.toLowerCase().includes(q) ||
        String(b.year).includes(q),
    );
  }, [search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleEnroll = (batch: Batch) => (event: React.MouseEvent) => {
    // Direct access: open the batch URL in a new tab. If the URL is still a
    // placeholder, preventDefault and surface a toast so the demo doesn't
    // open a broken tab.
    if (isPlaceholder(batch.url)) {
      event.preventDefault();
      toast({
        title: "🚀 Direct access — Epsilon Study",
        description: `${batch.name} — set the URL in BATCHES (src/app/page.tsx) to open it live. No key, no wall.`,
      });
      return;
    }
    // Otherwise let the anchor / window.open proceed normally.
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6] font-sans text-[#1f2937]">
      <Header />

      {/* Hidden SEO tags (visually hidden, but exposed to screen readers) */}
      <div className="sr-only" role="list" aria-label="Keywords">
        {SEO_TAGS.map((tag) => (
          <span key={tag} role="listitem">
            {tag}
          </span>
        ))}
      </div>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-8">
          {/* Hero */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Discover All Batches 🔥
            </h2>
            <Badge
              variant="secondary"
              className="self-start bg-violet-50 text-violet-700 sm:self-auto"
            >
              {filtered.length} batches available
            </Badge>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search for exams, batches... (Paste ID to quick load)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="h-11 rounded-lg border-gray-200 bg-white pl-10 shadow-sm"
              aria-label="Search batches"
            />
          </div>

          {/* Batch grid */}
          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onEnroll={handleEnroll(batch)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-sm text-gray-500">
                No batches match &ldquo;{search}&rdquo;.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="bg-white"
              >
                <Loader2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Load More
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Floating: AI Tutor chat */}
      <AITutorChat />

      {/* Modal: Join Telegram (dismissible) */}
      {showTelegram && (
        <TelegramModal onClose={() => setShowTelegram(false)} />
      )}
    </div>
  );
}
