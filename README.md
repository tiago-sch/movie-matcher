# MovieMatcher

Tell it how you feel. It finds your film.

MovieMatcher interprets your emotional state — not just genre preferences — and recommends movies that match your mood, energy, and watching context using Google Gemini AI.

**[tiagoschmidt.com](https://www.tiagoschmidt.com/) · [GitHub](https://github.com/tiago-sch/)**

---

## How it works

Instead of browsing genres, you describe how you feel. The app combines:

- **Free-text mood input** — write anything: *"comforting but not childish"*, *"smart but not heavy"*, *"chaotic and stylish"*
- **Mood sliders** — dial in energy (calm ↔ intense), tone (hopeful ↔ dark), and pace (slow ↔ fast)
- **Watching context** — alone / date night / with friends / background watch
- **Mental state** — tired / curious / overstimulated / emotional

Gemini interprets all of this together and returns:

- A **mood summary** — what your emotional state actually calls for
- **3 curated picks** — each with a "why this matches you", energy/warmth scores, and emotional tags
- **Alternatives** — safer, bolder, and weirder options alongside the main picks

Movie posters are fetched from TMDB (optional).

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **Framer Motion** — card entrance animations, loading state
- **Google Gemini** (`gemini-2.5-flash`) — mood interpretation and recommendations
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

Open `.env` and fill in your keys:

```env
# Required — https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=

# Optional — https://www.themoviedb.org/settings/api
# Without this, cards render without poster images
VITE_TMDB_API_KEY=
```

### 3. Run

```bash
npm run dev
```

---

## Project structure

```
src/
  api/
    gemini.ts       # Gemini API call + availability check
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

The app ships with **English** and **Brazilian Portuguese**. Toggle with the `PT` / `EN` button in the top-right corner. Prompts sent to Gemini are always in English regardless of the selected locale.

To add a new language, implement the `T` interface in `src/i18n/translations.ts` and add the locale to the `Locale` type.
