import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Epsilon Study - Fast CDN Platform",
  description:
    "Epsilon Study — high-speed CDN platform for content delivery. Open Server 1, Server 2, or Server 3 to access the Epsilon Study network with fast streaming and reliable uptime.",
  keywords: [
    "epsilon study",
    "epsilonstudy",
    "epsilon",
    "study platform",
    "fast cdn",
    "content delivery",
    "streaming",
    "epsilon cdn",
    "epsilon network",
    "epsilon study hub",
    "epsilon study server",
    "epsilon study hosting",
    "epsilon study stream",
    "high speed cdn",
    "education cdn",
    "streaming platform",
  ],
  authors: [{ name: "Epsilon Study" }],
  metadataBase: new URL("https://epsilon-study.app"),
  openGraph: {
    title: "Epsilon Study - Fast CDN Platform",
    description:
      "Fast CDN platform for content delivery — Epsilon Study. Open Server 1, 2, or 3 for high-speed streaming.",
    url: "https://epsilon-study.app",
    siteName: "Epsilon Study",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Epsilon Study - Fast CDN Platform",
    description:
      "Fast CDN platform for content delivery — Epsilon Study.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Epsilon Study - Fast CDN Platform",
  description:
    "Fast CDN platform for content delivery — Epsilon Study.",
  url: "https://epsilon-study.app/",
  keywords:
    "epsilon study, epsilonstudy, epsilon, fast cdn, content delivery",
  inLanguage: "en",
  isPartOf: {
    "@type": "WebSite",
    name: "Epsilon Study",
    url: "https://epsilon-study.app",
  },
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
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
