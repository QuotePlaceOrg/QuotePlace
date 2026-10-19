"use client";

import Link from "next/link";
import { ArrowLeft, Feather, ScrollText } from "lucide-react";
import { AdminReview } from "@/components/admin-review";
import { ContributionPortal } from "@/components/community-quotes";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold" aria-label="StoicBare home">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Feather className="h-5 w-5" /></span>
            <span>StoicBare</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("stoicbare:contribute"))}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              <ScrollText className="h-4 w-4" /> Sign in
            </button>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>
      <ContributionPortal />
      <AdminReview />
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        StoicBare · Editorial tools
      </footer>
    </div>
  );
}
