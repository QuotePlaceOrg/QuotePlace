import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// NOTE: Fonts load at runtime via <link> (not next/font/google) — the
// build-time next/font loader broke the Turbopack/OpenNext deploy (issue #2).
// If Google Fonts is unreachable, globals.css falls back to Georgia / system sans.
export const metadata: Metadata = {
  title: "StoicBare — Wisdom from the Ages",
  description:
    "A bare, focused collection of public-domain quotes — from Stoic sages (Marcus Aurelius, Seneca, Epictetus) and Greek philosophers (Socrates, Plato, Aristotle) to Eastern masters (Confucius, Lao Tzu), Enlightenment thinkers (Voltaire, Franklin, Kant), Transcendentalists (Emerson, Thoreau), and modern wits (Nietzsche, Tolstoy, Twain, Wilde). Curated for clarity, discipline, and resilience.",
  keywords: [
    "stoicbare",
    "stoicism",
    "stoic quotes",
    "philosophy quotes",
    "public domain quotes",
    "wisdom from the ages",
    "ancient wisdom",
    "marcus aurelius",
    "seneca",
    "epictetus",
    "musonius rufus",
    "cleanthes",
    "zeno of citium",
    "socrates",
    "plato",
    "aristotle",
    "confucius",
    "lao tzu",
    "cicero",
    "montaigne",
    "francis bacon",
    "voltaire",
    "benjamin franklin",
    "immanuel kant",
    "ralph waldo emerson",
    "henry david thoreau",
    "friedrich nietzsche",
    "leo tolstoy",
    "mark twain",
    "oscar wilde",
    "meditations",
    "enchiridion",
    "letters from a stoic",
    "analects",
    "tao te ching",
    "walden",
    "memento mori",
    "amor fati",
  ],
  authors: [{ name: "StoicBare" }],
  metadataBase: new URL("https://stoicbare.app"),
  openGraph: {
    title: "StoicBare — Wisdom from the Ages",
    description:
      "A bare, focused collection of public-domain quotes — Stoic sages, Greek philosophers, Eastern masters, Enlightenment thinkers, and modern wits. Curated for clarity, discipline, and resilience.",
    url: "https://stoicbare.app",
    siteName: "StoicBare",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "StoicBare — Wisdom from the Ages",
    description:
      "Public-domain quotes — Stoic, Greek, Eastern, Enlightenment, Transcendentalist, and modern wits.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StoicBare",
  description:
    "A bare, focused collection of public-domain quotes — Stoic sages, Greek philosophers, Eastern masters, Enlightenment thinkers, and modern wits.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap"
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
