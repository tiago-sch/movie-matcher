import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  checkAvailability, getRecommendations, OpenAiApiError, OpenAiParseError, type Locale,
  GENRE_LABELS, MENTAL_STATE_GUIDANCE, WATCHING_CONTEXTS,
} from './_lib/openai.js';
import { captchaConfigured, verifyCaptcha } from './_lib/turnstile.js';
import { isAllowedOrigin } from './_lib/hosts.js';
import { userIdFromAuthHeader } from './_lib/firebase.js';
import { saveFeel } from './_lib/feels.js';
import { attachPosters } from './_lib/tmdb.js';
import type { MoodInputs, RecommendResult } from '../src/types.js';

const MAX_TEXT_LENGTH = 500;

const strings = (value: unknown, max: number): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string').slice(0, max) : [];

const sliderValue = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(10, Math.max(1, Math.round(value))) : 5;

/** Rebuilds the mood from scratch so only known, well-typed fields ever reach the prompt. */
function sanitizeMood(raw: unknown): MoodInputs | null {
  if (!raw || typeof raw !== 'object') return null;
  const mood = raw as Record<string, unknown>;
  const text = typeof mood.text === 'string' ? mood.text.trim() : '';
  if (text.length > MAX_TEXT_LENGTH) return null;
  const sliders = (mood.sliders && typeof mood.sliders === 'object' ? mood.sliders : {}) as Record<string, unknown>;
  return {
    text,
    sliders: { energy: sliderValue(sliders.energy), tone: sliderValue(sliders.tone), pace: sliderValue(sliders.pace) },
    watchingContext: [...new Set(strings(mood.watchingContext, 10).filter(c => WATCHING_CONTEXTS.has(c)))],
    mentalState: typeof mood.mentalState === 'string' && Object.hasOwn(MENTAL_STATE_GUIDANCE, mood.mentalState) ? mood.mentalState : '',
    genres: [...new Set(strings(mood.genres, 20).filter(g => Object.hasOwn(GENRE_LABELS, g)))],
    sameLanguageOnly: mood.sameLanguageOnly === true,
  };
}

interface RecommendBody {
  mood?: MoodInputs;
  locale?: Locale;
  token?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    if (!captchaConfigured()) return res.status(200).json({ status: 'captcha-misconfigured' });
    const status = await checkAvailability();
    return res.status(200).json({ status });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method-not-allowed' });
  }

  if (!isAllowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'forbidden-origin' });

  let body: RecommendBody;
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as RecommendBody;
  } catch {
    return res.status(400).json({ error: 'bad-request' });
  }
  const mood = sanitizeMood(body.mood);
  if (!mood) return res.status(400).json({ error: 'bad-request' });
  const locale: Locale = body.locale === 'pt-BR' ? 'pt-BR' : 'en';

  const forwarded = req.headers['x-forwarded-for'];
  const remoteIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  const captcha = await verifyCaptcha(body.token, remoteIp);
  if (captcha === 'misconfigured') return res.status(500).json({ error: 'captcha-misconfigured' });
  if (captcha === 'rejected') return res.status(403).json({ error: 'captcha' });
  if (captcha === 'network-error') return res.status(502).json({ error: 'captcha-unavailable' });

  try {
    const [data, ownerId] = await Promise.all([
      getRecommendations(mood, locale),
      userIdFromAuthHeader(req.headers.authorization),
    ]);
    await attachPosters(data);
    let id: string | null = null;
    try {
      id = await saveFeel(mood, locale, data, ownerId);
    } catch (err) {
      // Still show the results even if they could not be saved
      console.error('Failed to save feel', err);
    }
    const result: RecommendResult = id ? { ...data, id } : data;
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof OpenAiParseError) return res.status(502).json({ error: 'parse' });
    if (err instanceof OpenAiApiError) return res.status(502).json({ error: 'api' });
    return res.status(500).json({ error: 'generic' });
  }
}
