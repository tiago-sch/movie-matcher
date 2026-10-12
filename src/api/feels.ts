import type { Feel, FeelSummary } from '../types';

// Feels are immutable, so anything fetched or just created can be reused for the session
const cache = new Map<string, Feel>();

export function rememberFeel(feel: Feel) {
  cache.set(feel.id, feel);
}

export function cachedFeel(id: string): Feel | undefined {
  return cache.get(id);
}

export async function fetchFeel(id: string): Promise<Feel | null> {
  const cached = cache.get(id);
  if (cached) return cached;
  const res = await fetch(`/api/feel?id=${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feel = await res.json() as Feel;
  cache.set(id, feel);
  return feel;
}

export async function fetchMyFeels(idToken: string): Promise<FeelSummary[]> {
  const res = await fetch('/api/feels', { headers: { Authorization: `Bearer ${idToken}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return ((await res.json()) as { feels: FeelSummary[] }).feels;
}

export async function removeMyFeel(idToken: string, id: string): Promise<void> {
  const res = await fetch(`/api/feels?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
