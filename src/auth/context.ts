import { createContext, useContext } from 'react';

export interface AuthUser {
  uid: string;
  name: string | null;
  photoUrl: string | null;
}

export interface AuthContextValue {
  /** false when Firebase is not configured — auth UI is hidden entirely */
  enabled: boolean;
  /** true until the initial auth state is known */
  loading: boolean;
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
