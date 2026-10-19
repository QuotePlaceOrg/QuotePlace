import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// NOTE: Fonts load at runtime via <link> (not next/font/google) — the
// build-time next/font loader broke the Turbopack/OpenNext deploy (issue #2).
// If Google Fonts is unreachable, globals.css falls back to Georgia / system serif.
export const metadata: Metadata = {
  title: "Quote Place — Words worth passing on",
  description:
    "Quote Place turns the best lines ever written into images you can send, post, or keep. Quotes of every genre — wisdom, life, love, success, poetry, grief, courage — with real attribution. No accounts to create, no watermarks, no noise.",
  keywords: [
    "quote place",
    "quotes",
    "quote images",
    "shareable quotes",
    "public domain quotes",
    "wisdom quotes",
    "life quotes",
    "love quotes",
    "motivational quotes",
    "poetry quotes",
    "quotes worth sharing",
    "marcus aurelius",
    "seneca",
    "epictetus",
    "confucius",
    "lao tzu",
    "oscar wilde",
    "mark twain",
    "ralph waldo emerson",
    "henry david thoreau",
    "friedrich nietzsche",
    "leo tolstoy",
    "meditations",
    "enchiridion",
    "letters from a stoic",
    "analects",
    "tao te ching",
    "walden",
  ],
  authors: [{ name: "Quote Place" }],
  metadataBase: new URL("https://stoicbare.app"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Quote Place — Words worth passing on",
    description:
      "The best lines ever written, set as images you can send, post, or keep. Quotes of every genre, with real attribution.",
    url: "https://stoicbare.app",
    siteName: "Quote Place",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Quote Place — Words worth passing on",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quote Place — Words worth passing on",
    description:
      "The best lines ever written, set as images you can send, post, or keep.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Quote Place",
  description:
    "Quote Place turns the best lines ever written into images you can send, post, or keep. Quotes of every genre, with real attribution.",
  url: "https://stoicbare.app/",
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <Toaster />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
