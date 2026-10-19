/**
 * Firebase client for StoicBare.
 *
 * Initialized lazily and only on the client (browser). The web SDK's
 * Analytics module accesses `window` and the browser cookie API, so it
 * must not run during Next.js server-side rendering. We use `isSupported()`
 * to gracefully skip environments where analytics can't run (e.g. private
 * browsing with cookies disabled).
 *
 * The Firebase web config (apiKey, appId, measurementId, etc.) is designed
 * to be public — security for your Firebase project is enforced by Firebase
 * Security Rules, not by hiding this config. You can move any of these
 * values to NEXT_PUBLIC_* env vars if you want to vary them per environment.
 */

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  type Analytics,
} from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyD5NrCTK71Rk4qVYsQyp_t-wrf55vskEHI",
  authDomain: "stoicbare-86bfa.firebaseapp.com",
  projectId: "stoicbare-86bfa",
  storageBucket: "stoicbare-86bfa.firebasestorage.app",
  messagingSenderId: "283688843634",
  appId: "1:283688843634:web:830af8f511ed9ebabec5eb",
  measurementId: "G-6W2P37RQJ6",
};

/**
 * Singleton Firebase App. Hot Module Reload (HMR) and React Strict Mode
 * can re-run module top-level code; `getApps()` lets us avoid
 * "Firebase App named '[DEFAULT]' already exists" errors.
 */
export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Firestore singleton. Firestore works on both server and client (it makes
 * HTTP requests under the hood, no `window` access), so we can init eagerly.
 * Designed for 100k+ quotes scale — see src/lib/firestore.ts for indexes.
 */
export const firestore: Firestore = getFirestore(firebaseApp);

/**
 * Auth singleton. Auth SDK accesses browser APIs (storage, popup) so it must
 * not run during SSR; getAuth() returns a stub on the server. We initialise
 * eagerly here — it only sets up internal state, doesn't open any sessions.
 * Use `onAuthStateChanged` in client components to subscribe to the user.
 */
export const auth: Auth = getAuth(firebaseApp);


/**
 * Cached Analytics instance (per browser session). `null` until
 * `getFirebaseAnalytics()` is awaited successfully in the browser.
 */
let analyticsInstance: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Initialize Firebase Analytics on the client only. Safe to call from a
 * React effect — returns `null` on the server or in unsupported environments.
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
      analyticsInstance = getAnalytics(firebaseApp);
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
  params?: Record<string, unknown>,
): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  const { logEvent: ga4LogEvent } = await import("firebase/analytics");
  ga4LogEvent(analytics, name, params);
}
