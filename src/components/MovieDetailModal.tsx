import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../i18n/context';
import { fetchMovieDetails, type MovieDetails } from '../api/tmdb';

export interface ModalMovie {
  title: string;
  year?: string;
  why: string;
  posterUrl?: string;
}

interface MovieDetailModalProps {
  movie: ModalMovie | null;
  onClose: () => void;
}

export function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const { t, locale } = useLocale();
  // Details are keyed by movie+locale so stale results never show for a new selection,
  // and "loading" is derived instead of set synchronously inside the effect.
  const movieKey = movie ? `${locale}|${movie.title}|${movie.year ?? ''}` : null;
  const [loaded, setLoaded] = useState<{ key: string; details: MovieDetails | null } | null>(null);
  const details = loaded && loaded.key === movieKey ? loaded.details : null;
  const loading = !!movieKey && loaded?.key !== movieKey;

  useEffect(() => {
    if (!movie || !movieKey) return;
    let active = true;
    fetchMovieDetails(movie.title, movie.year, locale)
      .then(d => { if (active) setLoaded({ key: movieKey, details: d }); })
      .catch(() => { if (active) setLoaded({ key: movieKey, details: null }); });
    return () => { active = false; };
  }, [movie, movieKey, locale]);

  useEffect(() => {
    if (!movie) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [movie, onClose]);

  const poster = details?.posterUrl ?? movie?.posterUrl ?? null;

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: 'rgba(3,3,10,0.8)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={movie.title}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label={t.close}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'white', border: '1px solid var(--border)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row">
              {/* Poster */}
              <div className="sm:w-[260px] shrink-0">
                <div className="aspect-[2/3] w-full overflow-hidden bg-[#0a0a1a] rounded-t-3xl sm:rounded-tr-none sm:rounded-l-3xl">
                  {poster ? (
                    <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center">
                      <span className="text-2xl font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.15)' }}>{movie.title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-7 flex flex-col gap-5 flex-1 min-w-0">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight pr-10">{details?.title ?? movie.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(details?.year ?? movie.year) && <span>{details?.year ?? movie.year}</span>}
                    {details?.runtime ? <span>{details.runtime} min</span> : null}
                    {details?.rating ? <span style={{ color: 'var(--accent)' }}>★ {details.rating.toFixed(1)}</span> : null}
                    {details?.genres.length ? <span>{details.genres.join(' · ')}</span> : null}
                  </div>
                </div>

                {/* Why it fits */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(245,158,11,0.6)' }}>{t.whyThisFits}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,200,120,0.9)' }}>{movie.why}</p>
                </div>

                {/* Overview */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.overview}</p>
                  {loading ? (
                    <div className="flex flex-col gap-2">
                      {[100, 92, 70].map(w => (
                        <div key={w} className="h-3 rounded animate-pulse" style={{ width: `${w}%`, background: 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                  ) : details?.overview ? (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{details.overview}</p>
                  ) : (
                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>{t.noDetails}</p>
                  )}
                </div>

                {/* Cast */}
                {(loading || (details?.cast.length ?? 0) > 0) && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{t.cast}</p>
                    {loading || !details ? (
                      <div className="flex gap-3">
                        {[0, 1, 2, 3].map(i => <div key={i} className="w-9 h-9 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
                      </div>
                    ) : (
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        {details.cast.map(c => (
                          <li key={`${c.name}-${c.character}`} className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              {c.profileUrl && <img src={c.profileUrl} alt={c.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-white truncate">{c.name}</p>
                              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{c.character}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Link */}
                {details?.tmdbUrl && (
                  <a
                    href={details.tmdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start px-4 py-2 rounded-full text-sm font-medium"
                    style={{ background: 'var(--accent)', color: '#1a1200' }}
                  >
                    {t.viewOnTmdb} ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
