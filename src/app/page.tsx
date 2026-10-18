/**
 * Epsilon Study — landing page.
 *
 * Reverse-engineered from https://studyrays.cc/ using REA (morluto/rea v6.7.0).
 * Captured Evidence: /home/z/my-project/rea-evidence/studyrays/capture.json
 *
 * Structure preserved from the source:
 *   <h1> brand
 *   <a class="epsilon-button epsilon-button-serverN"> 🔥/⚡/🚀 Open Server N 🔥/⚡/🚀 </a>
 *   (the source page's commented-out uptime monitor is intentionally omitted here)
 *
 * Replace the values in `SERVERS` below with the real Epsilon Study endpoints.
 */

"use client";

import { useSyncExternalStore } from "react";
import { useToast } from "@/hooks/use-toast";

type Server = {
  id: 1 | 2 | 3;
  label: string;
  emojiLeft: string;
  emojiRight: string;
  /** Replace with the real Epsilon Study endpoint for this server. */
  url: string;
  className: "epsilon-button-server1" | "epsilon-button-server2" | "epsilon-button-server3";
  description: string;
};

const SERVERS: Server[] = [
  {
    id: 1,
    label: "Open Server 1",
    emojiLeft: "🔥",
    emojiRight: "🔥",
    url: "https://server1.epsilon-study.app/",
    className: "epsilon-button-server1",
    description: "Primary high-speed streaming endpoint",
  },
  {
    id: 2,
    label: "Open Server 2",
    emojiLeft: "⚡",
    emojiRight: "⚡",
    url: "https://server2.epsilon-study.app/",
    className: "epsilon-button-server2",
    description: "Low-latency fallback CDN",
  },
  {
    id: 3,
    label: "Open Server 3",
    emojiLeft: "🚀",
    emojiRight: "🚀",
    url: "https://server3.epsilon-study.app/",
    className: "epsilon-button-server3",
    description: "Premium tier with global edge cache",
  },
];

// Hidden SEO tag list (mirrors the source page's hidden `.tags` block).
const SEO_TAGS = [
  "epsilon study",
  "epsilonstudy",
  "epsilon",
  "fast cdn",
  "content delivery",
  "streaming",
  "epsilon study cdn",
  "epsilon study network",
  "epsilon study platform",
  "high speed cdn",
  "education cdn",
  "streaming platform",
  "epsilon study hub",
  "epsilon study server",
  "epsilon study hosting",
];

function CurrentTime() {
  // useSyncExternalStore is the canonical pattern for subscribing to an
  // external ticking source (Date.now()). getServerSnapshot returns 0 on
  // the server so we render nothing during SSR (avoids hydration mismatch).
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
  return (
    <span suppressHydrationWarning>{formatted} IST</span>
  );
}

export default function Home() {
  const { toast } = useToast();

  const handleClick = (server: Server) => (event: React.MouseEvent) => {
    // The source page calls `window.open(url, "_blank")`. We keep the same
    // behaviour but also surface a toast so the action is observable. When
    // the URL is still a placeholder, we cancel the navigation so the demo
    // doesn't open a broken new tab. Replace the SERVERS urls above with
    // the real Epsilon Study endpoints to enable normal navigation.
    toast({
      title: `${server.emojiLeft} Opening ${server.label}`,
      description: `${server.description} — ${server.url}`,
    });
    const isPlaceholder = /\.epsilon-study\.app(\/|$)/.test(server.url);
    if (isPlaceholder) {
      event.preventDefault();
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-20 gap-10">
        <div className="flex flex-col items-center gap-3">
          <span className="epsilon-tag-pill">High-Speed CDN Platform</span>
          <h1
            className="epsilon-title"
            itemProp="name"
            aria-label="Epsilon Study"
          >
            Epsilon Study
          </h1>
          <p className="max-w-md text-center text-sm text-gray-600 sm:text-base">
            Fast, reliable content delivery. Pick a server below to enter the
            Epsilon Study network.
          </p>
        </div>

        {/* Hidden SEO tags (visually hidden, but exposed to screen readers as a list) */}
        <div className="sr-only" role="list" aria-label="Keywords">
          {SEO_TAGS.map((tag) => (
            <span key={tag} role="listitem">
              {tag}
            </span>
          ))}
        </div>

        {/* Server buttons */}
        <nav
          aria-label="Server selection"
          className="flex w-full max-w-md flex-col items-center gap-4"
        >
          {SERVERS.map((server, index) => (
            <a
              key={server.id}
              href={server.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick(server)}
              className={`epsilon-button ${server.className}`}
              style={{ animationDelay: `${0.15 * index + 0.2}s` }}
              aria-label={server.label}
              data-server-id={server.id}
            >
              <span aria-hidden="true">{server.emojiLeft}</span>
              <span>{server.label}</span>
              <span aria-hidden="true">{server.emojiRight}</span>
            </a>
          ))}
        </nav>

        {/* Live IST clock — confirms the page is interactive & hydrated */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            All systems operational · <CurrentTime />
          </span>
        </div>
      </section>

      {/* Sticky footer — stays at the bottom on short and long pages */}
      <footer className="mt-auto border-t border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 sm:flex-row sm:py-3">
          <p>
            © {new Date().getFullYear()} Epsilon Study · Fast CDN Platform
          </p>
          <p className="flex items-center gap-3">
            <span aria-hidden="true">🔥</span>
            <span aria-hidden="true">⚡</span>
            <span aria-hidden="true">🚀</span>
            <span className="ml-1">
              Reverse-engineered with REA · Rebuilt as Epsilon Study
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
