import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
