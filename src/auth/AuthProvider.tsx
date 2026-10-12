import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './context';

// Firebase is loaded on demand so it never weighs on the first paint.
const loadAuth = async () => {
  const [{ firebaseAuth, firebaseConfigured }, authSdk] = await Promise.all([
    import('../lib/firebase'),
    import('firebase/auth'),
  ]);
  return { auth: firebaseConfigured ? firebaseAuth() : null, sdk: authSdk };
};

const enabled = !!(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_APP_ID
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    loadAuth().then(({ auth, sdk }) => {
      if (cancelled) return;
      if (!auth) { setLoading(false); return; }
      unsubscribe = sdk.onAuthStateChanged(auth, u => {
        setUser(u ? { uid: u.uid, name: u.displayName, photoUrl: u.photoURL } : null);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  const signIn = useCallback(async () => {
    const { auth, sdk } = await loadAuth();
    if (!auth) return;
    try {
      await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
    } catch (err) {
      // Closing the popup is not an error worth surfacing
      const code = (err as { code?: string }).code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { auth, sdk } = await loadAuth();
    if (auth) await sdk.signOut(auth);
  }, []);

  const getIdToken = useCallback(async () => {
    if (!enabled) return null;
    const { auth } = await loadAuth();
    return auth?.currentUser ? auth.currentUser.getIdToken() : null;
  }, []);

  const value = useMemo(
    () => ({ enabled, loading, user, signIn, signOut, getIdToken }),
    [loading, user, signIn, signOut, getIdToken],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
