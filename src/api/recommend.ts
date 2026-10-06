import type { MoodInputs, RecommendationResponse } from '../types';
import type { Locale } from '../i18n/translations';

export type AvailabilityStatus =
  | 'ok' | 'no-key' | 'invalid-key' | 'model-unavailable' | 'quota-exceeded' | 'network-error' | 'captcha-misconfigured';

export type RecommendErrorKind = 'parse' | 'api' | 'captcha' | 'generic';

export class RecommendError extends Error {
  readonly kind: RecommendErrorKind;
  constructor(kind: RecommendErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'RecommendError';
    this.kind = kind;
  }
}

export async function checkAvailability(): Promise<AvailabilityStatus> {
  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) return 'captcha-misconfigured';
  try {
    const res = await fetch('/api/recommend');
    if (!res.ok) return 'network-error';
    const data = await res.json() as { status?: AvailabilityStatus };
    return data.status ?? 'network-error';
  } catch {
    return 'network-error';
  }
}

export async function getRecommendations(
  mood: MoodInputs,
  locale: Locale,
  token: string,
): Promise<RecommendationResponse> {
  let res: Response;
  try {
    res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, locale, token }),
    });
  } catch {
    throw new RecommendError('api', 'Network error');
  }

  if (!res.ok) {
    let kind: RecommendErrorKind = 'generic';
    try {
      const data = await res.json() as { error?: string };
      if (data.error === 'parse' || data.error === 'api') kind = data.error;
      else if (data.error === 'captcha' || data.error === 'captcha-misconfigured' || data.error === 'captcha-unavailable') kind = 'captcha';
    } catch { /* keep generic */ }
    throw new RecommendError(kind, `HTTP ${res.status}`);
  }

  return res.json() as Promise<RecommendationResponse>;
}
