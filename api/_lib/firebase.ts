import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App | null | undefined;

/** Lazily initializes the Admin SDK from FIREBASE_SERVICE_ACCOUNT (the service account JSON). */
function adminApp(): App | null {
  if (app !== undefined) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return (app = null);
  try {
    const account = JSON.parse(raw) as { project_id: string; client_email: string; private_key: string };
    app = getApps()[0] ?? initializeApp({
      credential: cert({
        projectId: account.project_id,
        clientEmail: account.client_email,
        // Some env editors store the key with literal "\n" sequences
        privateKey: account.private_key.replace(/\\n/g, '\n'),
      }),
    });
  } catch (err) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT', err);
    app = null;
  }
  return app;
}

export function db(): Firestore | null {
  const a = adminApp();
  return a ? getFirestore(a) : null;
}

/** Returns the Firebase uid for a "Bearer <idToken>" header, or null when absent/invalid. */
export async function userIdFromAuthHeader(header: string | undefined): Promise<string | null> {
  const a = adminApp();
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!a || !token) return null;
  try {
    return (await getAuth(a).verifyIdToken(token)).uid;
  } catch {
    return null;
  }
}
