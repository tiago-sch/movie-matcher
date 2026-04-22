import { motion } from 'framer-motion';
import { MovieCard, AlternativeCard } from './MovieCard';
import { useLocale } from '../i18n/context';
import type { RecommendationResponse } from '../types';

interface ResultsProps {
  data: RecommendationResponse;
  onReset: () => void;
}

export function Results({ data, onReset }: ResultsProps) {
  const { t } = useLocale();

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
            <MovieCard key={movie.title} movie={movie} index={i} />
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
                  <AlternativeCard key={movie.title} movie={movie} index={i} />
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
          {t.startOver}
        </button>
      </div>
    </motion.div>
  );
}
