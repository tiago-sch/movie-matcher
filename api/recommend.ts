import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAvailability, getRecommendations, OpenAiApiError, OpenAiParseError, type Locale } from './_lib/openai.js';
import { captchaConfigured, verifyCaptcha } from './_lib/turnstile.js';
import type { MoodInputs } from '../src/types.js';

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

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as RecommendBody;
  if (!body.mood || typeof body.mood !== 'object') return res.status(400).json({ error: 'bad-request' });
  const locale: Locale = body.locale === 'pt-BR' ? 'pt-BR' : 'en';

  const forwarded = req.headers['x-forwarded-for'];
  const remoteIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  const captcha = await verifyCaptcha(body.token, remoteIp);
  if (captcha === 'misconfigured') return res.status(500).json({ error: 'captcha-misconfigured' });
  if (captcha === 'rejected') return res.status(403).json({ error: 'captcha' });
  if (captcha === 'network-error') return res.status(502).json({ error: 'captcha-unavailable' });

  try {
    const data = await getRecommendations(body.mood, locale);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof OpenAiParseError) return res.status(502).json({ error: 'parse' });
    if (err instanceof OpenAiApiError) return res.status(502).json({ error: 'api' });
    return res.status(500).json({ error: 'generic' });
  }
}
