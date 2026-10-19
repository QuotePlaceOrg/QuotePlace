/**
 * StoicBare — bare, focused collection of public-domain Stoic quotes.
 *
 * Reverse-engineered from https://quotelibrary.org/ using REA
 * (morluto/rea v6.7.0). Captured Evidence:
 * /home/z/my-project/rea-evidence/quotelibrary/capture.json (612 KB).
 *
 * Source structure adapted:
 *   - Sticky header: logo + nav + search + Contribute CTA
 *   - Hero: big decorative quote marks + h1 + subtitle + search + popular topics
 *   - Quote of the Day: featured quote + author + share buttons + Read more
 *   - Browse by Author: author cards grid
 *   - Featured Quotes: quote cards grid
 *   - Footer: brand + copyright + quick links
 *
 * Source omitted (kept the page "bare"):
 *   - Story View promo, About features grid, FAQ, Newsletter signup
 *
 * All quotes are public domain (ancient Greek/Roman texts, 1st-2nd century
 * BC/AD). Authors: Marcus Aurelius, Seneca, Epictetus, Musonius Rufus,
 * Cleanthes, Zeno of Citium. Brand voice + visual design is original to
 * StoicBare (ivory + charcoal + antique bronze, Lora serif + Inter).
 */

"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContributionPortal, LiveQuoteLibrary } from "@/components/community-quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Twitter,
  Facebook,
  Linkedin,
  Share2,
  ArrowRight,
  Feather,
  ScrollText,
  X,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────────────────
// Data — authors
// ───────────────────────────────────────────────────────────────────────────

type Author = {
  id: string;
  name: string;
  epithet: string;
  lifespan: string;
  bio: string;
};

const AUTHORS: Author[] = [
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius",
    epithet: "Roman Emperor & Philosopher",
    lifespan: "121 – 180 AD",
    bio: "Last of the Five Good Emperors. His private journal, the Meditations, is the most intimate record of Stoic practice we have.",
  },
  {
    id: "seneca",
    name: "Seneca the Younger",
    epithet: "Philosopher, Statesman, Playwright",
    lifespan: "c. 4 BC – 65 AD",
    bio: "Tutor and advisor to Nero until forced to take his own life. His Epistulae Morales remain foundational Stoic reading.",
  },
  {
    id: "epictetus",
    name: "Epictetus",
    epithet: "Freed Slave & Teacher",
    lifespan: "c. 50 – 135 AD",
    bio: "Born a slave in the Eastern Empire. Taught in Nicopolis; the Enchiridion and Discourses were recorded by his student Arrian.",
  },
  {
    id: "musonius-rufus",
    name: "Musonius Rufus",
    epithet: "Roman Knight & Teacher",
    lifespan: "c. 20 – 101 AD",
    bio: "Called the 'Roman Socrates.' Teacher of Epictetus. Survived multiple exiles; fragments of his discourses survive via Stobaeus.",
  },
  {
    id: "cleanthes",
    name: "Cleanthes",
    epithet: "Second head of the Stoa",
    lifespan: "c. 330 – 230 BC",
    bio: "Succeeded Zeno as head of the Stoic school in Athens. His Hymn to Zeus is the most complete surviving Stoic poem.",
  },
  {
    id: "zeno",
    name: "Zeno of Citium",
    epithet: "Founder of Stoicism",
    lifespan: "c. 334 – 262 BC",
    bio: "Began teaching under the Stoa Poikilē — the Painted Porch of the Athenian agora — around 300 BC. The school's name derives from this colonnade.",
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Data — public-domain Stoic quotes
// ───────────────────────────────────────────────────────────────────────────

type Quote = {
  id: string;
  text: string;
  authorId: string;
  source: string;
  topics: string[];
};

const QUOTES: Quote[] = [
  // — Marcus Aurelius, Meditations —
  {
    id: "m1",
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book IV",
    topics: ["discipline", "resilience"],
  },
  {
    id: "m2",
    text: "The happiness of your life depends upon the quality of your thoughts.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book IV",
    topics: ["wisdom", "self-knowledge"],
  },
  {
    id: "m3",
    text: "Waste no more time arguing about what a good man should be. Be one.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book X",
    topics: ["virtue", "discipline"],
  },
  {
    id: "m4",
    text: "If it is not right, do not do it; if it is not true, do not say it.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book XII",
    topics: ["virtue", "discipline"],
  },
  {
    id: "m5",
    text: "The best revenge is not to be like your enemy.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book VI",
    topics: ["virtue", "anger"],
  },
  {
    id: "m6",
    text: "Confine yourself to the present.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book VII",
    topics: ["time", "discipline"],
  },
  {
    id: "m7",
    text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book VII",
    topics: ["wisdom", "self-knowledge"],
  },
  {
    id: "m8",
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    authorId: "marcus-aurelius",
    source: "Meditations, Book IV",
    topics: ["wisdom", "self-knowledge"],
  },

  // — Seneca, Epistulae Morales & essays —
  {
    id: "s1",
    text: "We suffer more often in imagination than in reality.",
    authorId: "seneca",
    source: "Epistulae Morales, Letter XIII",
    topics: ["resilience", "self-knowledge"],
  },
  {
    id: "s2",
    text: "Luck is what happens when preparation meets opportunity.",
    authorId: "seneca",
    source: "Attributed; cf. Epistulae Morales",
    topics: ["virtue", "discipline"],
  },
  {
    id: "s3",
    text: "Difficulties strengthen the mind, as labor does the body.",
    authorId: "seneca",
    source: "De Providentia",
    topics: ["resilience", "discipline"],
  },
  {
    id: "s4",
    text: "He who fears death will never do anything worthy of a living man.",
    authorId: "seneca",
    source: "Epistulae Morales, Letter XXX",
    topics: ["death", "courage"],
  },
  {
    id: "s5",
    text: "As is a tale, so is life: not how long it is, but how good it is, is what matters.",
    authorId: "seneca",
    source: "De Brevitate Vitae",
    topics: ["time", "virtue"],
  },
  {
    id: "s6",
    text: "While we wait for life, life passes.",
    authorId: "seneca",
    source: "De Brevitate Vitae",
    topics: ["time", "discipline"],
  },
  {
    id: "s7",
    text: "If a man knows not to which port he sails, no wind is favorable.",
    authorId: "seneca",
    source: "Epistulae Morales, Letter LXXI",
    topics: ["wisdom", "discipline"],
  },
  {
    id: "s8",
    text: "Wherever there is a human being, there is an opportunity for a kindness.",
    authorId: "seneca",
    source: "De Ira",
    topics: ["virtue", "anger"],
  },

  // — Epictetus, Enchiridion & Discourses —
  {
    id: "e1",
    text: "It's not what happens to you, but how you react to it that matters.",
    authorId: "epictetus",
    source: "Enchiridion, §5",
    topics: ["resilience", "discipline"],
  },
  {
    id: "e2",
    text: "Wealth consists not in having great possessions, but in having few wants.",
    authorId: "epictetus",
    source: "Discourses, III.9",
    topics: ["virtue", "self-knowledge"],
  },
  {
    id: "e3",
    text: "Make the best use of what is in your power, and take the rest as it happens.",
    authorId: "epictetus",
    source: "Enchiridion, §1",
    topics: ["resilience", "fate"],
  },
  {
    id: "e4",
    text:
      "Don't demand that things happen as you wish, but wish that they happen as they do happen, and it will go well with you.",
    authorId: "epictetus",
    source: "Enchiridion, §8",
    topics: ["fate", "resilience"],
  },
  {
    id: "e5",
    text: "No man is free who is not master of himself.",
    authorId: "epictetus",
    source: "Enchiridion (fragments)",
    topics: ["discipline", "self-knowledge"],
  },

  // — Musonius Rufus —
  {
    id: "r1",
    text: "The reward of philosophy is the perfection of the soul.",
    authorId: "musonius-rufus",
    source: "Fragments (Stobaeus)",
    topics: ["virtue", "wisdom"],
  },

  // — Cleanthes —
  {
    id: "c1",
    text: "Lead me, O Master of the mighty heavens, wheresoever you will.",
    authorId: "cleanthes",
    source: "Hymn to Zeus",
    topics: ["fate", "courage"],
  },

  // — Zeno of Citium —
  {
    id: "z1",
    text: "We have two ears and one mouth, so we should listen more than we say.",
    authorId: "zeno",
    source: "Attributed; Diogenes Laertius, VII.1.23",
    topics: ["wisdom", "discipline"],
  },
  {
    id: "z2",
    text: "Well-being is realized by small steps, but is truly no small thing.",
    authorId: "zeno",
    source: "Attributed; Stobaeus",
    topics: ["virtue", "discipline"],
  },
];

const TOPICS = [
  "wisdom",
  "virtue",
  "discipline",
  "resilience",
  "death",
  "anger",
  "time",
  "fate",
  "courage",
  "self-knowledge",
];

// Hidden SEO tags (mirrors the source page's hidden keywords block).
const SEO_TAGS = [
  "stoicbare",
  "stoicism",
  "stoic quotes",
  "marcus aurelius",
  "seneca",
  "epictetus",
  "musonius rufus",
  "cleanthes",
  "zeno of citium",
  "meditations",
  "enchiridion",
  "letters from a stoic",
  "memento mori",
  "amor fati",
  "stoic philosophy",
  "ancient wisdom",
];

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

const authorById = (id: string): Author =>
  AUTHORS.find((a) => a.id === id) ?? AUTHORS[0];

const quoteCountByAuthor = (id: string): number =>
  QUOTES.filter((q) => q.authorId === id).length;

// ───────────────────────────────────────────────────────────────────────────
// Live IST clock (useSyncExternalStore — hydration-safe, lint-clean)
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

// Quote of the Day — deterministic per calendar day, rotates through QUOTES
function useQuoteOfTheDay(): Quote {
  return useSyncExternalStore(
    (cb) => {
      const id = setInterval(cb, 60_000); // re-check hourly
      return () => clearInterval(id);
    },
    () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor(
        (now.getTime() - start.getTime()) / 86_400_000,
      );
      return QUOTES[dayOfYear % QUOTES.length];
    },
    () => QUOTES[0], // server snapshot — first quote
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Subcomponents
// ───────────────────────────────────────────────────────────────────────────

function Header({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-serif text-lg font-bold text-foreground"
          aria-label="StoicBare home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Feather className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>StoicBare</span>
        </a>

        {/* Primary nav (desktop only) */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {["Quotes", "Authors", "Topics", "About"].map((label) => (
            <a
              key={label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="relative ml-auto hidden flex-1 max-w-xs sm:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search for quotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-md border-border bg-card pl-9"
            aria-label="Search quotes"
          />
        </div>

        {/* Contribute CTA */}
        <Button
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-accent"
          onClick={() => window.dispatchEvent(new Event("stoicbare:contribute"))}
        >
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Contribute
        </Button>
      </div>
    </header>
  );
}

function Hero({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
        {/* Decorative quote marks */}
        <div
          aria-hidden="true"
          className="stoic-mark mb-4 text-7xl sm:text-8xl"
        >
          &ldquo;&rdquo;
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          {QUOTES.length} public-domain Stoic quotes · {AUTHORS.length} authors
        </p>

        <h1 className="mx-auto mb-4 max-w-3xl font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
          Find clarity in the wisdom of the Stoics.
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A bare, focused collection of quotes from Marcus Aurelius, Seneca,
          Epictetus, Musonius Rufus, Cleanthes, and Zeno. No ads, no
          distractions — just the words that have shaped human thought for two
          thousand years.
        </p>

        {/* Search */}
        <div className="mx-auto mb-6 max-w-xl">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search by keyword, author, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-md border-border bg-card pl-12 text-base shadow-sm"
              aria-label="Search Stoic quotes"
            />
          </div>
        </div>

        {/* Popular topics */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Popular:
          </span>
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              className="stoic-topic-pill"
              onClick={() => setSearch(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteOfTheDay({
  quote,
  author,
  onShare,
}: {
  quote: Quote;
  author: Author;
  onShare: (channel: string, quote: Quote, author: Author) => void;
}) {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <div className="stoic-divider mb-4" aria-hidden="true" />

        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          Quote of the Day
        </p>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Each day we feature a quote worth sitting with for a moment.
        </p>

        {/* Big quote */}
        <blockquote className="mb-6 text-center">
          <span
            aria-hidden="true"
            className="stoic-mark mb-4 block text-5xl text-primary"
          >
            &ldquo;
          </span>
          <p className="stoic-quote-text mx-auto max-w-3xl text-2xl leading-relaxed sm:text-3xl">
            {quote.text}
          </p>
          <p className="stoic-author-attr mt-6">
            — <span className="uppercase">{author.name}</span>
          </p>
          <p className="stoic-source mt-1">{quote.source}</p>
        </blockquote>

        {/* Topic pills */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {quote.topics.map((topic) => (
            <span key={topic} className="stoic-topic-pill">
              {topic}
            </span>
          ))}
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-background"
            onClick={() => onShare("twitter", quote, author)}
            aria-label="Share on Twitter"
          >
            <Twitter className="h-4 w-4" aria-hidden="true" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-background"
            onClick={() => onShare("facebook", quote, author)}
            aria-label="Share on Facebook"
          >
            <Facebook className="h-4 w-4" aria-hidden="true" />
            Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-background"
            onClick={() => onShare("linkedin", quote, author)}
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-background"
            onClick={() => onShare("copy", quote, author)}
            aria-label="Copy quote"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Copy
          </Button>
        </div>
      </div>
    </section>
  );
}

function BrowseByAuthor({
  authors,
  onPick,
}: {
  authors: Author[];
  onPick: (author: Author) => void;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            The Stoa
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Browse by Author
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            From the founder of the Stoa to its late Roman practitioners — six
            voices that shaped the school across five centuries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => {
            const count = quoteCountByAuthor(author.id);
            return (
              <button
                key={author.id}
                type="button"
                onClick={() => onPick(author)}
                className="stoic-card group text-left"
                aria-label={`Filter by ${author.name}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="stoic-author-avatar" aria-hidden="true">
                    {author.name.charAt(0)}
                  </span>
                  <div>
                    <div className="font-serif text-lg font-bold text-foreground">
                      {author.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {author.lifespan}
                    </div>
                  </div>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {author.epithet}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {author.bio}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-medium text-primary">
                    {count} quote{count === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground group-hover:text-primary">
                    Read <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuoteCard({
  quote,
  author,
  onAuthorClick,
}: {
  quote: Quote;
  author: Author;
  onAuthorClick: (author: Author) => void;
}) {
  return (
    <article className="stoic-card flex flex-col gap-3">
      <span aria-hidden="true" className="stoic-mark text-3xl text-primary">
        &ldquo;
      </span>
      <p className="stoic-quote-text text-lg leading-relaxed">{quote.text}</p>
      <div className="mt-auto">
        <button
          type="button"
          onClick={() => onAuthorClick(author)}
          className="stoic-author-attr hover:underline"
          aria-label={`Filter by ${author.name}`}
        >
          — {author.name}
        </button>
        <p className="stoic-source mt-1">{quote.source}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {quote.topics.map((topic) => (
          <span
            key={topic}
            className="stoic-topic-pill text-xs"
            aria-label={`Topic: ${topic}`}
          >
            {topic}
          </span>
        ))}
      </div>
    </article>
  );
}

function FeaturedQuotes({
  quotes,
  onAuthorClick,
}: {
  quotes: Quote[];
  onAuthorClick: (author: Author) => void;
}) {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              The Collection
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Featured Quotes
            </h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {quotes.length} shown of {QUOTES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              author={authorById(q.authorId)}
              onAuthorClick={onAuthorClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchResults({
  query,
  quotes,
  onAuthorClick,
}: {
  query: string;
  quotes: Quote[];
  onAuthorClick: (author: Author) => void;
}) {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Search Results
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {quotes.length} quote{quotes.length === 1 ? "" : "s"} for{" "}
            <span className="text-primary">&ldquo;{query}&rdquo;</span>
          </h2>
        </div>
        {quotes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                author={authorById(q.authorId)}
                onAuthorClick={onAuthorClick}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No Stoic quotes match &ldquo;{query}&rdquo;.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a topic like wisdom, virtue, death, or fate.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Feather className="h-4 w-4" aria-hidden="true" />
              </span>
              StoicBare
            </div>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              A bare, focused collection of public-domain Stoic quotes from
              Marcus Aurelius, Seneca, Epictetus, Musonius Rufus, Cleanthes,
              and Zeno. Built for clarity, discipline, and resilience.
            </p>
            <p className="text-xs text-muted-foreground">
              Quotes are drawn from ancient Greek and Roman texts in the public
              domain. Translations vary; sources are noted per quote.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Browse
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  All Quotes
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  Authors
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  Topics
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  Quote of the Day
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              About
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  About StoicBare
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  Contribute
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  Sources
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} StoicBare. All quotes are public domain.</p>
          <p className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Bare & online · <CurrentTime />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  const quoteOfTheDay = useQuoteOfTheDay();
  const authorOfTheDay = authorById(quoteOfTheDay.authorId);

  const searchResults = useMemo(() => {
    // If an author filter is set, search within that author's quotes
    let pool = QUOTES;
    if (authorFilter) {
      pool = QUOTES.filter((q) => q.authorId === authorFilter);
    }
    if (!search.trim()) return pool;
    const q = search.trim().toLowerCase();
    return pool.filter(
      (quote) =>
        quote.text.toLowerCase().includes(q) ||
        quote.source.toLowerCase().includes(q) ||
        quote.topics.some((t) => t.toLowerCase().includes(q)) ||
        authorById(quote.authorId)
          .name.toLowerCase()
          .includes(q),
    );
  }, [search, authorFilter]);

  // Decide what to show:
  // - If search/filter active → show SearchResults
  // - Else → show QoTD + BrowseByAuthor + FeaturedQuotes
  const isFiltering = Boolean(search.trim()) || Boolean(authorFilter);

  const handlePickAuthor = (author: Author) => {
    setAuthorFilter(author.id);
    setSearch("");
    // Scroll to results
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleClearFilter = () => {
    setAuthorFilter(null);
    setSearch("");
  };

  const handleShare = (
    channel: string,
    quote: Quote,
    author: Author,
  ) => {
    const text = `"${quote.text}" — ${author.name}`;
    if (channel === "copy") {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        void navigator.clipboard.writeText(text);
      }
      toast({
        title: "Quote copied",
        description: text,
      });
      return;
    }
    toast({
      title: `Share on ${channel}`,
      description: `Share this quote from ${author.name} on ${channel} — wire up your preferred share endpoint in src/app/page.tsx.`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header search={search} setSearch={setSearch} />
      <ContributionPortal />

      {/* Hidden SEO tags */}
      <div className="sr-only" role="list" aria-label="Keywords">
        {SEO_TAGS.map((tag) => (
          <span key={tag} role="listitem">
            {tag}
          </span>
        ))}
      </div>

      <main className="flex-1">
        {!isFiltering && (
          <>
            <Hero search={search} setSearch={setSearch} />
            <QuoteOfTheDay
              quote={quoteOfTheDay}
              author={authorOfTheDay}
              onShare={handleShare}
            />
            <BrowseByAuthor authors={AUTHORS} onPick={handlePickAuthor} />
            <FeaturedQuotes
              quotes={QUOTES.slice(0, 9)}
              onAuthorClick={handlePickAuthor}
            />
          </>
        )}

        {isFiltering && (
          <div id="results">
            {/* Filter banner */}
            <div className="border-b border-border bg-background">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Filtering by:</span>
                  {authorFilter && (
                    <span className="stoic-topic-pill text-primary">
                      Author: {authorById(authorFilter).name}
                    </span>
                  )}
                  {search.trim() && (
                    <span className="stoic-topic-pill text-primary">
                      &ldquo;{search}&rdquo;
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilter}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filter
                </Button>
              </div>
            </div>
            <SearchResults
              query={search.trim() || authorById(authorFilter ?? "").name}
              quotes={searchResults}
              onAuthorClick={handlePickAuthor}
            />
          </div>
        )}
        <LiveQuoteLibrary />
      </main>

      <Footer />
    </div>
  );
}
