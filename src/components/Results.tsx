import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MovieCard, AlternativeCard } from './MovieCard';
import { MovieDetailModal, type ModalMovie } from './MovieDetailModal';
import { useLocale } from '../i18n/context';
import type { RecommendationResponse } from '../types';

interface ResultsProps {
  data: RecommendationResponse;
  /** Saved feel id — enables the share link */
  feelId?: string;
  onReset: () => void;
}

function ShareButton({ feelId }: { feelId: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/f/${feelId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.copyLink, url);
    }
  };

  return (
    <button
      type="button"
      onClick={() => { void copy(); }}
      className="shrink-0 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors flex items-center gap-2"
      style={{ border: '1px solid rgba(245,158,11,0.4)', color: 'var(--accent)', background: 'rgba(245,158,11,0.08)' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied
          ? <path d="M20 6L9 17l-5-5" />
          : <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>}
      </svg>
      {copied ? t.linkCopied : t.copyLink}
    </button>
  );
}

export function Results({ data, feelId, onReset }: ResultsProps) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<ModalMovie | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  const alternativeSections = [
    { key: 'safer'  as const, label: t.safer,  description: t.saferDesc },
    { key: 'bolder' as const, label: t.bolder, description: t.bolderDesc },
    { key: 'weirder'as const, label: t.weirder, description: t.weirderDesc },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 pb-16"
    >
      {/* Title */}
      {(data.title || feelId) && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            {data.title && <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>{data.title}</h2>}
            {data.tagline && <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>{data.tagline}</p>}
          </div>
          {feelId && <ShareButton feelId={feelId} />}
        </div>
      )}

      {/* Mood summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(245,158,11,0.6)' }}>
          {t.moodRead}
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(245,200,120,0.9)' }}>
          {data.moodSummary}
        </p>
      </motion.div>

      {/* Main recommendations */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          {t.pickedForYou}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.recommendations.map((movie, i) => (
            <MovieCard key={`${movie.title}-${movie.year ?? ''}`} movie={movie} index={i} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {/* Alternatives */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {alternativeSections.map(({ key, label, description }) => {
          const movies = data.alternatives[key];
          if (!movies?.length) return null;
          return (
            <div key={key} className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{description}</p>
              </div>
              <div className="flex flex-col gap-2">
                {movies.map((movie, i) => (
                  <AlternativeCard key={`${movie.title}-${movie.year ?? ''}`} movie={movie} index={i} onSelect={setSelected} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
          onMouseEnter={e => {
            (e.currentTarget).style.borderColor = 'rgba(245,158,11,0.4)';
            (e.currentTarget).style.color = 'var(--accent)';
          }}
          onMouseLeave={e => {
            (e.currentTarget).style.borderColor = 'var(--border)';
            (e.currentTarget).style.color = 'var(--text-muted)';
          }}
        >
          {t.newSearch}
        </button>
      </div>

      <MovieDetailModal movie={selected} onClose={closeModal} />
    </motion.div>
  );
}
