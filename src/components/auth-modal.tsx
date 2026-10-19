"use client";

/**
 * Login modal — appears when the user clicks "Contribute" while signed out
 * (or any other action that requires auth).
 *
 * Pattern adapted from quotelibrary.org's flow: clicking Contribute when
 * logged out opens a modal with a Google sign-in button. After successful
 * sign-in, the modal closes and the Contribute form opens.
 */

import { useState } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { X, Loader2, Feather } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      // onAuthStateChanged will update `user`; AuthModal auto-closes via
      // the closeAuthModal call inside signInWithGoogle.
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Sign in to StoicBare"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-2 top-2 rounded-full p-1.5 text-primary-foreground/80 hover:bg-white/20 hover:text-primary-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Feather className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-xl font-bold">Welcome to StoicBare</h2>
          <p className="mt-1 text-xs text-primary-foreground/85">
            Sign in to contribute quotes, like your favourites, and follow
            authors.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <Button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full justify-center bg-white text-gray-800 shadow-sm hover:bg-gray-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleIcon className="h-4 w-4" aria-hidden="true" />
            )}
            {busy ? "Connecting…" : "Continue with Google"}
          </Button>

          {error && (
            <p className="mt-3 text-center text-xs text-destructive">
              {error}
            </p>
          )}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing, you agree to StoicBare&apos;s Terms of Service and
            acknowledge that contributions are reviewed before publishing.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Google "G" mark — inline so we don&apos;t ship a separate SVG asset. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
