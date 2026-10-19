import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { AuthProvider } from "@/components/auth-context";
import { AuthModal } from "@/components/auth-modal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        <Toaster />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
