import { motion } from 'framer-motion';
import { useLocale } from '../i18n/context';
import type { MovieRecommendation, AlternativeMovie } from '../types';

interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
}

function ScoreBar({ label, value, color }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-[10px] font-mono w-4 text-right" style={{ color: 'var(--text-muted)' }}>{value}</span>
    </div>
  );
}

interface MovieCardProps {
  movie: MovieRecommendation;
  index: number;
  onSelect: (movie: MovieRecommendation) => void;
}

export function MovieCard({ movie, index, onSelect }: MovieCardProps) {
  const { t } = useLocale();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(movie)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl overflow-hidden flex flex-col text-left cursor-pointer group"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      aria-label={`${movie.title}${movie.year ? ` (${movie.year})` : ''} — ${t.viewDetails}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0a0a1a]">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 text-center">
            <span className="text-2xl font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.15)' }}>
              {movie.title}
            </span>
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to top, var(--card), transparent)' }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold text-white text-base leading-tight">{movie.title}</h3>
            {movie.year && <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{movie.year}</span>}
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--accent)' }}>{t.viewDetails} →</p>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <ScoreBar label={t.energyLabel} value={movie.energy} color="#f59e0b" />
          <ScoreBar label={t.warmthLabel} value={movie.warmth} color="#14b8a6" />
        </div>

        {movie.emotionalTags && movie.emotionalTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {movie.emotionalTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px]"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

interface AlternativeCardProps {
  movie: AlternativeMovie;
  index: number;
  onSelect: (movie: AlternativeMovie) => void;
}

export function AlternativeCard({ movie, index, onSelect }: AlternativeCardProps) {
  const { t } = useLocale();
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(movie)}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer w-full"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      aria-label={`${movie.title}${movie.year ? ` (${movie.year})` : ''} — ${t.viewDetails}`}
    >
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-medium text-white text-sm truncate">{movie.title}</span>
        {movie.year && <span className="text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>{movie.year}</span>}
      </div>
      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>→</span>
    </motion.button>
  );
}
