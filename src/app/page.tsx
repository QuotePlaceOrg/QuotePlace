import Link from "next/link";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import QuoteCard from "@/components/QuoteCard";
import { listQuotes } from "@/lib/db";

export const dynamic = "force-dynamic";

// Theme: Quote Place design system (white / ink / teal / copper, Playfair Display logo + Fraunces + Newsreader
// + IBM Plex Mono). The <link> tags for these fonts live in layout.tsx; the
// Georgia fallbacks keep the editorial serif look if a font fails to load.
const SERIF_DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif";
const SERIF_BODY = "'Newsreader', Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace";

const PAPER = "#FFFFFF";
const INK = "#1A1815";
const FADED = "#6B6459";
const HAIRLINE = "#E5E5E0";
const TEAL = "#0F3D3E";

function toCardQuote(q: { id: string; text: string; authorId: string; topics: string[]; source: string }) {
  return { id: q.id, text: q.text, authorId: q.authorId, topics: q.topics, source: q.source, language: "en" as const };
}

// Mood chips from the homepage spec. /quotes reads only ?q= and ?sort=, so each
// mood maps to a real search term that matches an existing topic slug — no
// invented mood pages, no dead links.
const MOODS: { label: string; q: string }[] = [
  { label: "Courage", q: "courage" },
  { label: "Heartbreak", q: "love" },
  { label: "Starting over", q: "resilience" },
  { label: "Patience", q: "fate" },
  { label: "Ambition", q: "discipline" },
  { label: "Grief", q: "death" },
  { label: "Joy", q: "life" },
  { label: "Doubt", q: "self-knowledge" },
  { label: "Love", q: "love" },
  { label: "Discipline", q: "discipline" },
  { label: "Letting go", q: "fate" },
  { label: "Hope", q: "life" },
];

export default async function Home() {
  // Trending = real Firestore order by likeCount. Newest = real Firestore order
  // by createdAt. No counts are invented; cards show only real data.
  const [{ quotes: trendingDocs }, { quotes: newestDocs }] = await Promise.all([
    listQuotes({ sort: "most-liked", pageSize: 6 }),
    listQuotes({ sort: "newest", pageSize: 15 }),
  ]);
  const trending = trendingDocs.map((q) => ({ quote: toCardQuote(q), likeCount: q.likeCount }));
  const newest = newestDocs.map((q) => ({ quote: toCardQuote(q), likeCount: q.likeCount }));

  return (
    <div style={{ backgroundColor: PAPER, color: INK, fontFamily: SERIF_BODY }}>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 style={{ fontFamily: SERIF_DISPLAY }} className="max-w-3xl text-4xl font-semibold leading-[1.05] md:text-[56px]">
          Say it better than you could.
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.65]">
          Quote Place turns the best lines ever written into images you can send, post, or keep. No accounts to create, no watermarks, no noise.
        </p>
        <form action="/quotes" method="get" role="search" className="mt-8 flex w-full max-w-xl">
          <label htmlFor="home-search" className="sr-only">Search quotes</label>
          <input
            id="home-search"
            name="q"
            type="search"
            placeholder="Search a feeling, a person, a subject…"
            style={{ borderColor: HAIRLINE }}
            className="w-full border bg-white px-4 py-3 text-[17px] outline-none placeholder:text-[#6B6459] focus:border-[#0F3D3E]"
          />
          <button
            type="submit"
            style={{ backgroundColor: INK }}
            className="shrink-0 px-5 py-3 text-[15px] text-white transition-colors hover:bg-[#0F3D3E]"
          >
            Find a quote
          </button>
        </form>
        <p style={{ color: FADED }} className="mt-3 text-sm">
          Try: courage · Marcus Aurelius · letting go
        </p>
      </section>

      {/* Today's quote */}
      <section style={{ borderColor: HAIRLINE }} className="mx-auto max-w-6xl border-t px-4 py-14 md:py-20">
        <h2 style={{ fontFamily: SERIF_DISPLAY }} className="text-[26px] font-semibold leading-[1.15] md:text-[32px]">
          Today&apos;s quote
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-[1.65]">
          One line for today, set as an image. Share it as it is, or save it for later.
        </p>
        <div className="mt-6 max-w-[640px]">
          <QuoteOfTheDay />
        </div>
      </section>

      {/* Browse by mood / topic */}
      <section style={{ borderColor: HAIRLINE }} className="mx-auto max-w-6xl border-t px-4 py-14 md:py-20">
        <h2 style={{ fontFamily: SERIF_DISPLAY }} className="text-[26px] font-semibold leading-[1.15] md:text-[32px]">
          What are you feeling today?
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-[1.65]">
          Start with the mood, not the author. Pick one and the quotes find you.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Link
              key={m.label}
              href={`/quotes?q=${encodeURIComponent(m.q)}`}
              style={{ borderColor: HAIRLINE }}
              className="border bg-white px-3.5 py-2 text-sm transition-colors hover:border-[#1A1815] hover:underline"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Liked most right now */}
      <section style={{ borderColor: HAIRLINE }} className="mx-auto max-w-6xl border-t px-4 py-14 md:py-20">
        <h2 style={{ fontFamily: SERIF_DISPLAY }} className="text-[26px] font-semibold leading-[1.15] md:text-[32px]">
          Liked most right now
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-[1.65]">
          The quotes people are liking most this week.
        </p>
        <div className="mt-6 flex max-w-[640px] flex-col gap-6">
          {trending.map(({ quote, likeCount }) => (
            <QuoteCard key={quote.id} quote={quote} likeCount={likeCount} />
          ))}
        </div>
      </section>

      {/* Just added */}
      <section style={{ borderColor: HAIRLINE }} className="mx-auto max-w-6xl border-t px-4 py-14 md:py-20">
        <h2 style={{ fontFamily: SERIF_DISPLAY }} className="text-[26px] font-semibold leading-[1.15] md:text-[32px]">
          Just added
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-[1.65]">
          Fresh lines, added this week. Some are centuries old and new to this site — that counts.
        </p>
        <div className="mt-6 flex max-w-[640px] flex-col gap-6">
          {newest.map(({ quote, likeCount }) => (
            <QuoteCard key={quote.id} quote={quote} likeCount={likeCount} />
          ))}
        </div>
      </section>

      {/* How sharing works */}
      <section style={{ borderColor: HAIRLINE }} className="mx-auto max-w-6xl border-t px-4 py-14 md:py-20">
        <h2 style={{ fontFamily: SERIF_DISPLAY }} className="text-[26px] font-semibold leading-[1.15] md:text-[32px]">
          Three taps and it&apos;s gone
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-[1.65]">
          No account, no editing, no watermark to crop out. What you see is what your friends get.
        </p>
        <ol className="mt-8 max-w-2xl space-y-6">
          <li>
            <p style={{ fontFamily: MONO }} className="text-[11px] uppercase tracking-[0.14em] text-[#6B6459]">
              Step 1
            </p>
            <p className="mt-1 text-[17px] leading-[1.65]">
              <strong>Pick a quote.</strong> Browse, search, or take today&apos;s. The image is already made.
            </p>
          </li>
          <li>
            <p style={{ fontFamily: MONO }} className="text-[11px] uppercase tracking-[0.14em] text-[#6B6459]">
              Step 2
            </p>
            <p className="mt-1 text-[17px] leading-[1.65]">
              <strong>Choose how it looks.</strong> Square for the feed, tall for the story, wide for X and LinkedIn.
            </p>
          </li>
          <li>
            <p style={{ fontFamily: MONO }} className="text-[11px] uppercase tracking-[0.14em] text-[#6B6459]">
              Step 3
            </p>
            <p className="mt-1 text-[17px] leading-[1.65]">
              <strong>Send it.</strong> Download it, or share straight to Instagram, Facebook, X, or LinkedIn.
            </p>
          </li>
        </ol>
      </section>

      {/* About */}
      <section style={{ borderColor: HAIRLINE }} className="mx-auto max-w-6xl border-t px-4 py-14 md:py-20">
        <h2 style={{ fontFamily: SERIF_DISPLAY }} className="text-[26px] font-semibold leading-[1.15] md:text-[32px]">
          Why quotes?
        </h2>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-[1.65]">
          Because most of us feel things before we can say them. A good quote is someone — sometimes someone dead two thousand years — saying the thing you have
          been carrying around, cleanly, in one line. Quote Place collects those lines, sets them in images worth looking at, and gets out of the way. We do not
          write the quotes. We do not improve them. We just make them easy to pass on.
        </p>
      </section>
    </div>
  );
}
