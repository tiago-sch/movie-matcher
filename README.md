# MovieMatcher

Tell it how you feel. It finds your film.

MovieMatcher interprets your emotional state — not just genre preferences — and recommends movies that match your mood, energy, and watching context using OpenAI (ChatGPT).

**[tiagoschmidt.com](https://www.tiagoschmidt.com/) · [GitHub](https://github.com/tiago-sch/)**

---

## How it works

Instead of browsing genres, you describe how you feel. The app combines:

- **Free-text mood input** — write anything: *"comforting but not childish"*, *"smart but not heavy"*, *"chaotic and stylish"*
- **Mood sliders** — dial in energy (calm ↔ intense), tone (hopeful ↔ dark), and pace (slow ↔ fast)
- **Watching context** — alone / date night / with friends / background watch
- **Mental state** — tired / curious / overstimulated / emotional

ChatGPT interprets all of this together and returns:

- A **mood summary** — what your emotional state actually calls for
- **3 curated picks** — each with a "why this matches you", energy/warmth scores, and emotional tags
- **Alternatives** — safer, bolder, and weirder options alongside the main picks

Movie posters are fetched from TMDB (optional).

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **Framer Motion** — card entrance animations, loading state
- **OpenAI** (`gpt-4o-mini` by default, override with `OPENAI_MODEL`) — mood interpretation and recommendations, called from a Vercel serverless function so the key never reaches the browser
- **reCAPTCHA Enterprise** (score-based, invisible) — bot protection, verified server-side
- **TMDB API** — movie posters (optional)
- Custom i18n — English and Brazilian Portuguese, no external library

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys. Variables without the `VITE_` prefix are server-only and are read by the function in `api/recommend.ts`; on Vercel, set them in the project's Environment Variables.

```env
# --- Server-side ---
OPENAI_API_KEY=        # Required — https://platform.openai.com/api-keys
OPENAI_MODEL=          # Optional — defaults to gpt-4o-mini
GCP_PROJECT_ID=        # Required — Google Cloud project that owns the reCAPTCHA key
RECAPTCHA_API_KEY=     # Required — Google Cloud API key with reCAPTCHA Enterprise API access
RECAPTCHA_SITE_KEY=    # Required — same site key as below
RECAPTCHA_MIN_SCORE=   # Optional — 0.0–1.0, defaults to 0.5

# --- Client-side ---
VITE_RECAPTCHA_SITE_KEY=   # Required — reCAPTCHA Enterprise score-based site key
VITE_TMDB_API_KEY=         # Optional — https://www.themoviedb.org/settings/api
```

To create the reCAPTCHA key: Google Cloud Console → Security → reCAPTCHA → Create key, type **Score-based**, add your production domain and `localhost`. Then create an API key under APIs & Services → Credentials, restricted to the reCAPTCHA Enterprise API.

### 3. Run

The `/api/recommend` function only exists under the Vercel runtime, so local development uses the Vercel CLI instead of plain `vite`:

```bash
npx vercel dev
```

`npm run dev` still works for UI-only work, but requests to `/api/recommend` will 404.

---

## Project structure

```
api/
  recommend.ts      # Vercel function: verifies reCAPTCHA, calls OpenAI
  _lib/
    openai.ts       # OpenAI prompt + API call + availability check (server-only)
    recaptcha.ts    # reCAPTCHA Enterprise assessment (server-only)
src/
  api/
    recommend.ts    # Client for /api/recommend
    recaptcha.ts    # Loads enterprise.js and fetches tokens
    tmdb.ts         # TMDB poster fetching
  components/
    MoodForm.tsx    # Mood input form (text, sliders, chips)
    MovieCard.tsx   # Main card + alternative card
    Results.tsx     # Results layout (summary, picks, alternatives)
    LoadingState.tsx
    SliderInput.tsx
  i18n/
    translations.ts # EN and PT-BR strings
    context.tsx     # LocaleProvider + useLocale hook
  types.ts
  App.tsx
```

---

## i18n

The app ships with **English** and **Brazilian Portuguese**. Toggle with the `PT` / `EN` button in the top-right corner. Prompts sent to OpenAI are always in English regardless of the selected locale.

To add a new language, implement the `T` interface in `src/i18n/translations.ts` and add the locale to the `Locale` type.
