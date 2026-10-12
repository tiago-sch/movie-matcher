import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = !!(config.apiKey && config.authDomain && config.projectId && config.appId);

let auth: Auth | null = null;

export function firebaseAuth(): Auth | null {
  if (!firebaseConfigured) return null;
  auth ??= getAuth(initializeApp(config));
  return auth;
}
