import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAnalytics } from "@/components/firebase-analytics";

export const metadata: Metadata = {
  title: "StoicBare — Wisdom from the Stoics",
  description:
    "A bare, focused collection of public-domain Stoic quotes from Marcus Aurelius, Seneca, Epictetus, Musonius Rufus, Cleanthes, and Zeno. Curated for clarity, discipline, and resilience.",
  keywords: [
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
    "wisdom",
    "virtue",
    "discipline",
    "resilience",
    "memento mori",
    "amor fati",
  ],
  authors: [{ name: "StoicBare" }],
  metadataBase: new URL("https://stoicbare.app"),
  openGraph: {
    title: "StoicBare — Wisdom from the Stoics",
    description:
      "A bare, focused collection of public-domain Stoic quotes. Curated for clarity, discipline, and resilience.",
    url: "https://stoicbare.app",
    siteName: "StoicBare",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "StoicBare — Wisdom from the Stoics",
    description: "Public-domain Stoic quotes, curated for clarity.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StoicBare",
  description:
    "A bare, focused collection of public-domain Stoic quotes from Marcus Aurelius, Seneca, Epictetus, Musonius Rufus, Cleanthes, and Zeno.",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="font-sans antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
