import type { MoodInputs, RecommendationResponse } from '../../src/types.js';

export type Locale = 'en' | 'pt-BR';

const LANGUAGE_INSTRUCTIONS: Record<Locale, string> = {
  'en': 'Write all prose fields (moodSummary, why, genres, emotionalTags) in English.',
  'pt-BR': 'Write all prose fields (moodSummary, why, genres, emotionalTags) in Brazilian Portuguese. This only sets the language of your text — it must NOT bias which films you pick toward Brazilian or Portuguese-language cinema.',
};

const LANGUAGE_NAMES: Record<Locale, string> = {
  'en': 'English',
  'pt-BR': 'Portuguese',
};

const MENTAL_STATE_GUIDANCE: Record<string, string> = {
  tired: 'tired — low cognitive load, easy to follow, nothing that demands intense focus',
  curious: 'curious — wants ideas, discovery, something that rewards attention',
  overstimulated: 'overstimulated — needs calm, gentle, uncluttered films; avoid loud, chaotic or frantic ones',
  emotional: 'emotional — open to feeling things; films with emotional depth and catharsis',
  elevated: 'elevated (relaxed, a little high) — favor hypnotic, visually lush, immersive, surreal or absurdly funny films with strong sound/visual design; easy-to-follow plots over convoluted ones; avoid anxiety-inducing horror or bleak, heavy dramas. Never mention drugs or being high in your text — phrase it as a dreamy, sensory, "lose yourself in it" vibe',
};

const GENRE_LABELS: Record<string, string> = {
  drama: 'drama', comedy: 'comedy', romance: 'romance', thriller: 'thriller', horror: 'horror',
  'sci-fi': 'science fiction', fantasy: 'fantasy', action: 'action', crime: 'crime', mystery: 'mystery',
  animation: 'animation', documentary: 'documentary', musical: 'musical', war: 'war', western: 'western',
  arthouse: 'arthouse / auteur cinema',
};

const WATCHING_CONTEXTS = new Set(['alone', 'date night', 'with friends', 'background watch']);

const SYSTEM_PROMPT = `You are a cinematic mood interpreter. You analyze emotional states, energy levels, and viewing contexts to recommend movies that deeply resonate with how someone feels right now — not just genre preferences.

Your recommendations should feel curated by someone who intimately knows both the viewer's current emotional state and the full breadth of cinema history.

Always respond with ONLY valid JSON matching this exact schema — no markdown, no code blocks, no explanation:
{
  "moodSummary": "2-3 sentences interpreting the viewer's emotional state and what cinematic experience they need right now",
  "recommendations": [
    {
      "title": "Movie Title",
      "year": "YYYY",
      "why": "1-2 sentences explaining why this movie fits this specific mood",
      "energy": 1,
      "warmth": 1,
      "genres": ["style1", "style2"],
      "emotionalTags": ["tag1", "tag2", "tag3"]
    }
  ],
  "alternatives": {
    "safer": [{"title": "...", "year": "...", "why": "...", "genres": ["..."], "emotionalTags": ["...", "..."]}],
    "bolder": [{"title": "...", "year": "...", "why": "...", "genres": ["..."], "emotionalTags": ["...", "..."]}],
    "weirder": [{"title": "...", "year": "...", "why": "...", "genres": ["..."], "emotionalTags": ["...", "..."]}]
  }
}

Rules:
- Provide exactly 3 main recommendations
- Provide exactly 2 alternatives in each of safer/bolder/weirder
- energy: 1=completely calm/meditative, 10=high-octane/intense
- warmth: 1=cold/bleak/isolated, 10=warm/comforting/connected
- genres: 1-3 film styles/genres of the film (e.g. "drama", "sci-fi", "animation"), lowercase
- emotionalTags: 2-4 short descriptive tags (2-3 for alternatives) (e.g. "intimate", "melancholic", "visually stunning")
- Recommend real, existing films only
- Prioritize less obvious choices — avoid defaulting to the most popular titles
- Draw from world cinema as a whole: mix countries, regions and eras (Hollywood, Europe, Asia, Latin America, Africa, Middle East…). Do not concentrate on a single country unless the viewer explicitly asks for it or a language restriction is given
- Every viewer input (feelings text, sliders, context, mental state, film styles, language restriction) must visibly shape the picks, and each "why" should reflect the relevant ones
- Use the film's best-known title (original or international English title) in "title" so it can be looked up reliably`;

export type AvailabilityStatus = 'ok' | 'no-key' | 'invalid-key' | 'model-unavailable' | 'quota-exceeded' | 'network-error';

const OPENAI_BASE = 'https://api.openai.com/v1';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function authHeaders(apiKey: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
}

export async function checkAvailability(): Promise<AvailabilityStatus> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'no-key';

  try {
    const modelRes = await fetch(`${OPENAI_BASE}/models/${MODEL}`, { headers: authHeaders(apiKey) });
    if (modelRes.status === 401 || modelRes.status === 403) return 'invalid-key';
    if (modelRes.status === 404) return 'model-unavailable';
    if (modelRes.status === 429) return 'quota-exceeded';
    if (!modelRes.ok) return 'network-error';
  } catch {
    return 'network-error';
  }

  try {
    const quotaRes = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });
    if (quotaRes.status === 429) return 'quota-exceeded';
  } catch {
    return 'network-error';
  }

  return 'ok';
}

export class OpenAiApiError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'OpenAiApiError';
    this.cause = cause;
  }
}

export class OpenAiParseError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'OpenAiParseError';
    this.cause = cause;
  }
}

export async function getRecommendations(mood: MoodInputs, locale: Locale = 'en', exclude: string[] = []): Promise<RecommendationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const sliderDescriptions = {
    energy: mood.sliders.energy <= 3 ? 'calm' : mood.sliders.energy >= 7 ? 'intense' : 'moderate energy',
    tone: mood.sliders.tone <= 3 ? 'hopeful/uplifting' : mood.sliders.tone >= 7 ? 'dark/heavy' : 'tonal balance',
    pace: mood.sliders.pace <= 3 ? 'slow/contemplative' : mood.sliders.pace >= 7 ? 'fast/kinetic' : 'moderate pace',
  };

  const watchingContext = (Array.isArray(mood.watchingContext) ? mood.watchingContext : []).filter(c => WATCHING_CONTEXTS.has(c));
  const mentalState = MENTAL_STATE_GUIDANCE[mood.mentalState] ?? '';
  const genres = (Array.isArray(mood.genres) ? mood.genres : []).map(g => GENRE_LABELS[g]).filter(Boolean);

  const userMessage = [
    mood.text ? `How I'm feeling: "${mood.text}"` : '',
    `Mood sliders (1–10 scale):`,
    `- Energy: ${mood.sliders.energy}/10 (${sliderDescriptions.energy})`,
    `- Tone: ${mood.sliders.tone}/10 (${sliderDescriptions.tone})`,
    `- Pace: ${mood.sliders.pace}/10 (${sliderDescriptions.pace})`,
    watchingContext.length ? `Watching context: ${watchingContext.join(', ')}` : '',
    mentalState ? `Mental state: ${mentalState}` : '',
    genres.length
      ? `Film styles wanted: ${genres.join(', ')} — every main recommendation and alternative must clearly belong to at least one of these styles (blends are welcome)`
      : '',
    mood.sameLanguageOnly
      ? `Language restriction: ONLY recommend films whose original spoken language is ${LANGUAGE_NAMES[locale]} — from any country where it is spoken. This applies to every recommendation and alternative.`
      : 'Language: any original language — favor a varied, international mix of countries.',
    exclude.length
      ? `Already shown — do NOT recommend any of these again (anywhere in the response): ${exclude.join('; ')}`
      : '',
  ].filter(Boolean).join('\n');

  let text: string;
  try {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTIONS[locale]}` },
          { role: 'user', content: userMessage },
        ],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    text = (data.choices?.[0]?.message?.content ?? '').trim();
  } catch (err) {
    throw new OpenAiApiError('OpenAI API call failed', err);
  }

  // Strip markdown code fences if the model wraps the JSON anyway
  const json = text.startsWith('```') ? text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '') : text;

  try {
    return JSON.parse(json) as RecommendationResponse;
  } catch (err) {
    throw new OpenAiParseError('Failed to parse OpenAI response', err);
  }
}
