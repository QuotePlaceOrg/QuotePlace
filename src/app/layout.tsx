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
  title: "Epsilon Study — Discover All Batches",
  description:
    "Epsilon Study — discover and enroll in exam-prep batches for JEE, NEET, IOQM, CLAT, IPMAT, KCET, CAPF, GPAT and more. Direct access, no key wall, no waiting.",
  keywords: [
    "epsilon study",
    "epsilonstudy",
    "epsilon",
    "study dashboard",
    "exam prep",
    "JEE 2027",
    "NEET 2027",
    "IOQM",
    "CLAT",
    "IPMAT",
    "KCET",
    "CAPF",
    "GPAT",
    "batches",
    "online coaching",
    "test series",
  ],
  authors: [{ name: "Epsilon Study" }],
  metadataBase: new URL("https://epsilon-study.app"),
  openGraph: {
    title: "Epsilon Study — Discover All Batches",
    description:
      "Discover and enroll in exam-prep batches for JEE, NEET, IOQM, CLAT, IPMAT, KCET, CAPF and more. Direct access, no key wall.",
    url: "https://epsilon-study.app",
    siteName: "Epsilon Study",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Epsilon Study — Discover All Batches",
    description:
      "Discover and enroll in exam-prep batches. Direct access, no key wall.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Epsilon Study",
  description:
    "Discover and enroll in exam-prep batches for JEE, NEET, IOQM, CLAT, IPMAT, KCET, CAPF and more. Direct access, no key wall.",
  url: "https://epsilon-study.app/",
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
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
