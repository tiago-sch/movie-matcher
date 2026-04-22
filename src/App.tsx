import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LocaleProvider, useLocale } from './i18n/context';
import type { Locale } from './i18n/translations';
import { MoodForm } from './components/MoodForm';
import { LoadingState } from './components/LoadingState';
import { Results } from './components/Results';
import { getRecommendations, checkAvailability, GeminiApiError, GeminiParseError, type AvailabilityStatus } from './api/gemini';
import { fetchMoviePoster } from './api/tmdb';
import type { MoodInputs, RecommendationResponse } from './types';
import './App.css';

type AppState = 'form' | 'loading' | 'results' | 'error';

function AppInner() {
  const { t, locale, setLocale } = useLocale();
  const [appState, setAppState] = useState<AppState>('form');
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState<AvailabilityStatus | 'checking'>('checking');

  useEffect(() => {
    checkAvailability().then(setApiStatus);
  }, []);

  const handleSubmit = async (mood: MoodInputs) => {
    setAppState('loading');
    setError('');
    try {
      const data = await getRecommendations(mood, locale);
      const posterPromises = data.recommendations.map(movie =>
        fetchMoviePoster(movie.title, movie.year).then(url => { if (url) movie.posterUrl = url; })
      );
      await Promise.allSettled(posterPromises);
      setResults(data);
      setAppState('results');
    } catch (err) {
      if (err instanceof GeminiParseError) {
        setError(t.errors.parse);
      } else if (err instanceof GeminiApiError) {
        setError(t.errors.api);
      } else {
        setError(t.errors.generic);
      }
      setAppState('error');
    }
  };

  const handleReset = () => { setResults(null); setError(''); setAppState('form'); };

  const apiReady = apiStatus === 'ok';
  const warning = apiStatus !== 'ok' && apiStatus !== 'checking'
    ? t.warnings[apiStatus as Exclude<AvailabilityStatus, 'ok'>]
    : null;

  const otherLocale: Locale = locale === 'en' ? 'pt-BR' : 'en';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 w-full flex-1">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ color: 'white', letterSpacing: '-0.03em' }}
          >
            movie<span style={{ color: 'var(--accent)' }}>matcher</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>

          {/* Lang switcher */}
          <button
            onClick={() => setLocale(otherLocale)}
            className="absolute right-0 top-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.4)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            {t.langSwitch}
          </button>
        </motion.header>

        {/* API status banner */}
        <AnimatePresence>
          {apiStatus === 'checking' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3 text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="block w-3.5 h-3.5 rounded-full border-2 border-transparent shrink-0"
                style={{ borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>{t.checking}</span>
            </motion.div>
          )}

          {warning && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-4 mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(252,165,165,0.9)' }}
            >
              <strong>{warning.title}</strong> {warning.detail}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {appState === 'form' && (
            <motion.div key="form" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <MoodForm onSubmit={handleSubmit} isLoading={false} disabled={!apiReady} />
            </motion.div>
          )}
          {appState === 'loading' && (
            <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <LoadingState />
            </motion.div>
          )}
          {appState === 'results' && results && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Results data={results} onReset={handleReset} />
            </motion.div>
          )}
          {appState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <p className="text-base" style={{ color: 'rgba(252,165,165,0.9)' }}>{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full text-sm cursor-pointer"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
              >
                {t.tryAgain}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer
        className="py-6 flex items-center justify-center gap-5 text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <span>{t.footerMadeBy} <a
          href="https://www.tiagoschmidt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors"
          style={{ color: 'var(--text)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
        >Tiago Schmidt</a></span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <a
          href="https://github.com/tiago-sch/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {t.footerGithub}
        </a>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <AppInner />
    </LocaleProvider>
  );
}
