"use client";

/**
 * Auth context for StoicBare.
 *
 * Wraps the app in `RootLayout`, subscribes to `onAuthStateChanged`, and
 * exposes the current user + a Google sign-in helper to any client component
 * via `useAuth()`. Also upserts the user's profile doc to Firestore on
 * sign-in (idempotent).
 *
 * The auth-modal open state is local to the components that need it, but
 * we centralise it here so the modal can be triggered from anywhere via
 * `useAuth().openAuthModal()` (e.g. the "Contribute" CTA in the header).
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { upsertUserDoc } from "@/lib/firestore";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const upsertedRef = useRef<Set<string>>(new Set());

  // Subscribe to auth state changes. `onAuthStateChanged` returns an
  // unsubscribe fn we call on cleanup.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u && !upsertedRef.current.has(u.uid)) {
        upsertedRef.current.add(u.uid);
        // Fire-and-forget: keep auth flow snappy even if Firestore is slow.
        void upsertUserDoc({
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
        }).catch((e) => console.warn("[auth] upsert user doc failed:", e));
      }
    });
    return unsub;
  }, []);

  const signInWithGoogle = useMemo(
    () => async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        await signInWithPopup(auth, provider);
        setIsAuthModalOpen(false);
      } catch (e) {
        console.warn("[auth] google sign-in failed:", e);
        throw e;
      }
    },
    [],
  );

  const signOut = useMemo(
    () => async () => {
      await firebaseSignOut(auth);
    },
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAuthModalOpen,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false),
      signInWithGoogle,
      signOut,
    }),
    [user, loading, isAuthModalOpen, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
