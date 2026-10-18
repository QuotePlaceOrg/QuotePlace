/**
 * Epsilon Study — direct-access landing page.
 *
 * Reverse-engineered from https://studyrays.cc/ using REA (morluto/rea v6.7.0),
 * then simplified per the product decision: the source page's three "Open Server"
 * buttons (which all linked to the same URL anyway) have been collapsed into a
 * single direct-access entry. Visiting `/` auto-redirects to TARGET_URL after
 * COUNTDOWN_SECONDS; a manual "Enter Now" button is provided as a fallback for
 * browsers that block auto-redirect.
 *
 * To enable live redirect: set TARGET_URL below to the real Epsilon Study
 * endpoint. While it still matches the *.epsilon-study.app placeholder,
 * auto-redirect is disabled and the button surfaces a toast instead of
 * opening a broken URL.
 *
 * Captured Evidence: /home/z/my-project/rea-evidence/studyrays/capture.json
 */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useToast } from "@/hooks/use-toast";

// ┌──────────────────────────────────────────────────────────────────────┐
// │ Direct-access target. Visiting / redirects here after COUNTDOWN_SECONDS. │
// │ Replace with the real Epsilon Study endpoint.                       │
// └──────────────────────────────────────────────────────────────────────┘
const TARGET_URL = "https://app.epsilon-study.app/";
const COUNTDOWN_SECONDS = 3;

// A URL whose host ends with epsilon-study.app is treated as a placeholder.
const isPlaceholderUrl = (url: string) =>
  /\.epsilon-study\.app(\/|$)/.test(url);

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
  const isPlaceholder = isPlaceholderUrl(TARGET_URL);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  // Guard against React StrictMode double-fire of the effect causing two
  // redirects, and against the user clicking the button while a redirect
  // is already in flight.
  const redirectedRef = useRef(false);

  // Countdown + auto-redirect. Skipped while the target URL is still the
  // placeholder so the demo doesn't kick users out to a non-existent host.
  useEffect(() => {
    if (isPlaceholder) return;
    if (secondsLeft <= 0) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        window.location.href = TARGET_URL;
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, isPlaceholder]);

  const handleEnterClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isPlaceholder) {
      toast({
        title: "🔗 Direct access target not configured",
        description: `Set TARGET_URL in src/app/page.tsx — current placeholder is ${TARGET_URL}`,
      });
      return;
    }
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      window.location.href = TARGET_URL;
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
            {isPlaceholder
              ? "Direct access — set TARGET_URL in src/app/page.tsx to enable redirect."
              : `Direct access — you'll be redirected to the Epsilon Study network in ${secondsLeft}s.`}
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

        {/* Single direct-access button (replaces the source's 3 server buttons) */}
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <a
            href={isPlaceholder ? "#" : TARGET_URL}
            onClick={handleEnterClick}
            className="epsilon-button epsilon-button-server3"
            style={{ animationDelay: "0.35s" }}
            aria-label="Enter Epsilon Study"
            data-target-url={TARGET_URL}
          >
            <span aria-hidden="true">🚀</span>
            <span>{isPlaceholder ? "Configure Target" : "Enter Now"}</span>
            <span aria-hidden="true">🚀</span>
          </a>

          {!isPlaceholder && (
            <p className="text-xs text-gray-500" aria-live="polite">
              Auto-redirect in{" "}
              <span className="font-bold text-gray-800">{secondsLeft}</span>{" "}
              second{secondsLeft === 1 ? "" : "s"}, or click the button.
            </p>
          )}
        </div>

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
          <p>© {new Date().getFullYear()} Epsilon Study · Fast CDN Platform</p>
          <p className="flex items-center gap-3">
            <span aria-hidden="true">🚀</span>
            <span className="ml-1">
              Direct access enabled · Reverse-engineered with REA
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
