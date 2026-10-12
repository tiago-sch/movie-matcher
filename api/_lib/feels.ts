import { randomInt } from 'node:crypto';
import { db } from './firebase.js';
import type { Feel, FeelLocale, FeelSummary, MoodInputs, RecommendationResponse } from '../../src/types.js';

const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_LENGTH = 10;
export const ID_PATTERN = /^[a-zA-Z0-9]{6,20}$/;

function newId(): string {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) id += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return id;
}

interface StoredFeel extends Omit<Feel, 'id'> {
  ownerId: string | null;
}

/**
 * Persists a search so its link can be reopened without calling the model again.
 * Owned feels are also indexed under users/{uid}/feels for the "my feels" list.
 * Returns null when the database is not configured.
 */
export async function saveFeel(
  mood: MoodInputs,
  locale: FeelLocale,
  results: RecommendationResponse,
  ownerId: string | null,
): Promise<string | null> {
  const firestore = db();
  if (!firestore) return null;

  const createdAt = new Date().toISOString();
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newId();
    const stored: StoredFeel = { createdAt, locale, mood, results, ownerId };
    try {
      await firestore.collection('feels').doc(id).create(stored);
    } catch (err) {
      if ((err as { code?: number }).code === 6) continue; // ALREADY_EXISTS — retry with a new id
      throw err;
    }
    if (ownerId) {
      const summary: Omit<FeelSummary, 'id'> = {
        createdAt,
        title: results.title,
        tagline: results.tagline,
        ...(results.recommendations[0]?.posterUrl ? { posterUrl: results.recommendations[0].posterUrl } : {}),
      };
      await firestore.collection('users').doc(ownerId).collection('feels').doc(id).set(summary);
    }
    return id;
  }
  throw new Error('Could not allocate a feel id');
}

export async function getFeel(id: string): Promise<Feel | null> {
  const firestore = db();
  if (!firestore || !ID_PATTERN.test(id)) return null;
  const snap = await firestore.collection('feels').doc(id).get();
  if (!snap.exists) return null;
  const { createdAt, locale, mood, results } = snap.data() as StoredFeel;
  return { id, createdAt, locale, mood, results };
}

export async function listUserFeels(uid: string, limit = 50): Promise<FeelSummary[]> {
  const firestore = db();
  if (!firestore) return [];
  const snap = await firestore.collection('users').doc(uid).collection('feels')
    .orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<FeelSummary, 'id'>) }));
}

/** Removes a feel from the user's list. The public link keeps working for anyone it was shared with. */
export async function removeUserFeel(uid: string, id: string): Promise<void> {
  const firestore = db();
  if (!firestore || !ID_PATTERN.test(id)) return;
  await firestore.collection('users').doc(uid).collection('feels').doc(id).delete();
}
