# Feelpick

Tell it how you feel. It finds your film.

Feelpick interprets your emotional state — not just genre preferences — and recommends movies that match your mood, energy, and watching context using OpenAI (ChatGPT).

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
- **Cloudflare Turnstile** (invisible, managed mode) — bot protection, verified server-side
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
TURNSTILE_SECRET_KEY=  # Required — Cloudflare Turnstile secret key
ALLOWED_HOSTNAMES=     # Optional — hostnames allowed to call the API (defaults to feelpick.com + localhost)
FIREBASE_SERVICE_ACCOUNT= # Optional — service account JSON; enables shareable links + My feels

# --- Client-side ---
VITE_TURNSTILE_SITE_KEY=   # Required — Cloudflare Turnstile site key
VITE_TMDB_API_KEY=         # Optional — https://www.themoviedb.org/settings/api
VITE_FIREBASE_API_KEY=     # Optional — Firebase web config; enables Google sign-in
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

To create the Turnstile keys: dash.cloudflare.com → Turnstile → Add widget, mode **Managed**, add your production domain and `localhost`. Copy the site key and secret key.

### Firebase (optional — shareable links and "My feels")

1. Create a project at console.firebase.google.com and add a **Web** app; copy its config into the `VITE_FIREBASE_*` vars.
2. **Authentication** → Sign-in method → enable **Google**; add your production domain under Authorized domains.
3. **Firestore Database** → create it in production mode and keep the rules fully locked (`allow read, write: if false;`) — only the API functions touch the database, through the Admin SDK.
4. Project settings → Service accounts → **Generate new private key**; paste the whole JSON into `FIREBASE_SERVICE_ACCOUNT`.

Every search is stored in `feels/{id}` and served at `/f/{id}` without calling OpenAI again. Searches made while signed in are also indexed under `users/{uid}/feels`.

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
  recommend.ts      # Vercel function: verifies Turnstile token, calls OpenAI, saves the feel
  feel.ts           # GET a saved feel by id (public)
  feels.ts          # List / remove the signed-in user's feels
  _lib/
    openai.ts       # OpenAI prompt + API call + availability check (server-only)
    turnstile.ts    # Turnstile siteverify call + hostname check (server-only)
    firebase.ts     # Firebase Admin init + ID token verification
    feels.ts        # Save / load / list feels in Firestore
    tmdb.ts         # Server-side poster lookup so saved feels include posters
    hosts.ts        # Allowed hostnames for Origin / Turnstile checks
src/
  api/
    recommend.ts    # Client for /api/recommend
    turnstile.ts    # Loads the Turnstile script and mounts the invisible widget
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
