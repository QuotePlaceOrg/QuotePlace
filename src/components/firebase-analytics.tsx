"use client";

/**
 * Mounts Firebase Analytics once on the client. Renders nothing.
 *
 * Sits in the root layout body so analytics initializes as soon as the
 * first client bundle hydrates, without coupling analytics concerns to
 * individual pages. Uses an effect so the init runs after hydration
 * (no SSR / no hydration mismatch).
 */

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

export function FirebaseAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);
  return null;
}
