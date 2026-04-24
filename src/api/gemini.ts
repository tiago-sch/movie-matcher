import { GoogleGenerativeAI } from '@google/generative-ai';
import type { MoodInputs, RecommendationResponse } from '../types';
import type { Locale } from '../i18n/translations';

const LANGUAGE_INSTRUCTIONS: Record<Locale, string> = {
  'en': 'Respond in English.',
  'pt-BR': 'Responda em português do Brasil.',
};

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
      "emotionalTags": ["tag1", "tag2", "tag3"]
    }
  ],
  "alternatives": {
    "safer": [{"title": "...", "year": "...", "why": "..."}],
    "bolder": [{"title": "...", "year": "...", "why": "..."}],
    "weirder": [{"title": "...", "year": "...", "why": "..."}]
  }
}

Rules:
- Provide exactly 3 main recommendations
- Provide exactly 2 alternatives in each of safer/bolder/weirder
- energy: 1=completely calm/meditative, 10=high-octane/intense
- warmth: 1=cold/bleak/isolated, 10=warm/comforting/connected
- emotionalTags: 2-4 short descriptive tags (e.g. "intimate", "melancholic", "visually stunning")
- Recommend real, existing films only
- Prioritize less obvious choices — avoid defaulting to the most popular titles`;

export type AvailabilityStatus = 'ok' | 'no-key' | 'invalid-key' | 'model-unavailable' | 'network-error';

export async function checkAvailability(): Promise<AvailabilityStatus> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return 'no-key';

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${apiKey}`
    );
    if (res.ok) return 'ok';
    if (res.status === 400 || res.status === 401 || res.status === 403) return 'invalid-key';
    if (res.status === 404) return 'model-unavailable';
    return 'network-error';
  } catch {
    return 'network-error';
  }
}

export class GeminiApiError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'GeminiApiError';
    this.cause = cause;
  }
}

export class GeminiParseError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'GeminiParseError';
    this.cause = cause;
  }
}

export async function getRecommendations(mood: MoodInputs, locale: Locale = 'en'): Promise<RecommendationResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `${SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTIONS[locale]}`,
  });

  const sliderDescriptions = {
    energy: mood.sliders.energy <= 3 ? 'calm' : mood.sliders.energy >= 7 ? 'intense' : 'moderate energy',
    tone: mood.sliders.tone <= 3 ? 'hopeful/uplifting' : mood.sliders.tone >= 7 ? 'dark/heavy' : 'tonal balance',
    pace: mood.sliders.pace <= 3 ? 'slow/contemplative' : mood.sliders.pace >= 7 ? 'fast/kinetic' : 'moderate pace',
  };

  const userMessage = [
    mood.text ? `How I'm feeling: "${mood.text}"` : '',
    `Mood sliders (1–10 scale):`,
    `- Energy: ${mood.sliders.energy}/10 (${sliderDescriptions.energy})`,
    `- Tone: ${mood.sliders.tone}/10 (${sliderDescriptions.tone})`,
    `- Pace: ${mood.sliders.pace}/10 (${sliderDescriptions.pace})`,
    mood.watchingContext.length ? `Watching context: ${mood.watchingContext.join(', ')}` : '',
    mood.mentalState ? `Mental state: ${mood.mentalState}` : '',
  ].filter(Boolean).join('\n');

  let text: string;
  try {
    const result = await model.generateContent(userMessage);
    text = result.response.text().trim();
  } catch (err) {
    throw new GeminiApiError('Gemini API call failed', err);
  }

  // Strip markdown code fences if the model wraps the JSON anyway
  const json = text.startsWith('```') ? text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '') : text;

  try {
    return JSON.parse(json) as RecommendationResponse;
  } catch (err) {
    throw new GeminiParseError('Failed to parse Gemini response', err);
  }
}
