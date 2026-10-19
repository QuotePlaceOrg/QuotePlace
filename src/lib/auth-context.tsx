// Auth context — Firebase Auth when configured, guest mode otherwise.
// On sign-in, ensures a `users/{uid}` doc exists (see db.ensureUserDoc).
"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import { ensureUserDoc, getUserDoc } from "./db";
import type { UserDoc } from "./types";

type AuthState = {
  configured: boolean;
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureUserDoc({ uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL, providerId: u.providerData[0]?.providerId });
          setProfile(await getUserDoc(u.uid));
        } catch { setProfile(null); }
      } else setProfile(null);
      setLoading(false);
    });
  }, []);

  async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured — add NEXT_PUBLIC_FIREBASE_* to .env.local");
    await signInWithPopup(auth, new GoogleAuthProvider());
  }
  async function signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured");
    await signInWithEmailAndPassword(auth, email, password);
  }
  async function signUp(name: string, email: string, password: string) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  }
  async function logOut() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setUser(null); setProfile(null);
  }

  return <Ctx.Provider value={{ configured, user, profile, loading, signInWithGoogle, signInWithEmail, signUp, logOut }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
