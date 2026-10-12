import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoodForm } from '../components/MoodForm';
import { LoadingState } from '../components/LoadingState';
import { Results } from '../components/Results';
import { StatusMessage } from '../components/StatusMessage';
import { useLocale } from '../i18n/context';
import { useAuth } from '../auth/context';
import { getRecommendations, RecommendError } from '../api/recommend';
import { rememberFeel } from '../api/feels';
import { navigate } from '../lib/router';
import type { MoodInputs, RecommendationResponse } from '../types';

declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;

type HomeState = 'form' | 'loading' | 'results' | 'error';

interface HomePageProps {
  apiReady: boolean;
  getCaptchaToken: () => Promise<string | null>;
  lastMood: MoodInputs | null;
  onMoodChange: (mood: MoodInputs) => void;
}

export function HomePage({ apiReady, getCaptchaToken, lastMood, onMoodChange }: HomePageProps) {
  const { t, locale } = useLocale();
  const auth = useAuth();
  const [state, setState] = useState<HomeState>('form');
  const [error, setError] = useState('');
  // Only used when the database is unavailable and results can't get their own page
  const [unsaved, setUnsaved] = useState<RecommendationResponse | null>(null);

  const handleSubmit = async (mood: MoodInputs) => {
    setState('loading');
    setError('');
    onMoodChange(mood);
    gtag('event', 'search', {
      mood_text: mood.text,
      energy: mood.sliders.energy,
      tone: mood.sliders.tone,
      pace: mood.sliders.pace,
      watching_context: mood.watchingContext.join(', ') || 'none',
      mental_state: mood.mentalState || 'none',
      genres: mood.genres.join(', ') || 'none',
      same_language_only: mood.sameLanguageOnly,
      signed_in: !!auth.user,
      locale,
    });
    try {
      const [captchaToken, idToken] = await Promise.all([getCaptchaToken(), auth.getIdToken().catch(() => null)]);
      if (!captchaToken) throw new RecommendError('captcha');
      const { id, ...results } = await getRecommendations(mood, locale, captchaToken, idToken);
      if (id) {
        rememberFeel({ id, createdAt: new Date().toISOString(), locale, mood, results });
        navigate(`/f/${id}`);
        return;
      }
      setUnsaved(results);
      setState('results');
    } catch (err) {
      setError(err instanceof RecommendError && err.kind !== 'generic' ? t.errors[err.kind] : t.errors.generic);
      setState('error');
    }
  };

  const reset = () => { setUnsaved(null); setError(''); setState('form'); };

  const signInHint = auth.enabled && !auth.loading && !auth.user ? (
    <button
      type="button"
      onClick={() => { void auth.signIn(); }}
      className="self-center text-xs cursor-pointer underline underline-offset-4 decoration-dotted"
      style={{ color: 'var(--text-muted)' }}
    >
      {t.signInToSave}
    </button>
  ) : null;

  return (
    <AnimatePresence mode="wait">
      {state === 'form' && (
        <motion.div key="form" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <MoodForm onSubmit={handleSubmit} initial={lastMood} footer={signInHint} isLoading={false} disabled={!apiReady} />
        </motion.div>
      )}
      {state === 'loading' && (
        <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <LoadingState />
        </motion.div>
      )}
      {state === 'results' && unsaved && (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Results data={unsaved} onReset={reset} />
        </motion.div>
      )}
      {state === 'error' && (
        <motion.div key="error">
          <StatusMessage message={error} tone="error" action={{ label: t.tryAgain, onClick: reset }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
