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
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0a0a1a]">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
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
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text)' }}>{movie.why}</p>
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
    </motion.div>
  );
}

interface AlternativeCardProps {
  movie: AlternativeMovie;
  index: number;
}

export function AlternativeCard({ movie, index }: AlternativeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-medium text-white text-sm">{movie.title}</span>
        {movie.year && <span className="text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>{movie.year}</span>}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{movie.why}</p>
    </motion.div>
  );
}
