// Firebase client — env-based config only (no hardcoded keys), safe when env
// vars are missing (the site falls back to the static seed).
// Analytics is client-only and lazy: it must not run during SSR.
// Never import this from a server component that must build without env vars:
// every getter returns null when the config is incomplete.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }
  app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });
  return app;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  return a ? getFirestore(a) : null;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

/**
 * Cached Analytics instance (per browser session). `null` until
 * `getFirebaseAnalytics()` is awaited successfully in the browser.
 */
let analyticsInstance: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Initialize Firebase Analytics on the client only. Safe to call from a
 * React effect — returns `null` on the server, when Firebase is not
 * configured, or in unsupported environments.
 *
 * Idempotent: the same instance is returned on subsequent calls.
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    // Server-side: no analytics.
    return Promise.resolve(null);
  }
  if (analyticsInstance) {
    return Promise.resolve(analyticsInstance);
  }
  if (analyticsPromise) {
    return analyticsPromise;
  }
  analyticsPromise = isSupported()
    .then((supported) => {
      if (!supported) return null;
      const a = getFirebaseApp();
      if (!a) return null;
      analyticsInstance = getAnalytics(a);
      return analyticsInstance;
    })
    .catch((err) => {
      console.warn("[firebase] analytics init failed:", err);
      return null;
    });
  return analyticsPromise;
}

/**
 * Log a GA4 event. No-op on the server or if analytics didn't initialize.
 * Safe to call from any client-side code; you do not need to await
 * `getFirebaseAnalytics()` first.
 */
export async function logEvent(
  name: string,
  params?: Record<string, unknown>
): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  const { logEvent: ga4LogEvent } = await import("firebase/analytics");
  ga4LogEvent(analytics, name, params);
}
