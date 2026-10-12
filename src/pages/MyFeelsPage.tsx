import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatusMessage } from '../components/StatusMessage';
import { useLocale } from '../i18n/context';
import { useAuth } from '../auth/context';
import { fetchMyFeels, removeMyFeel } from '../api/feels';
import { linkClick, navigate } from '../lib/router';
import type { FeelSummary } from '../types';

type Loaded = { uid: string; feels: FeelSummary[] | null };

export function MyFeelsPage() {
  const { t, locale } = useLocale();
  const { enabled, loading: authLoading, user, signIn, getIdToken } = useAuth();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const current = user && loaded?.uid === user.uid ? loaded : null;

  useEffect(() => {
    if (!user) return;
    let active = true;
    getIdToken()
      .then(token => (token ? fetchMyFeels(token) : null))
      .then(feels => { if (active) setLoaded({ uid: user.uid, feels }); })
      .catch(() => { if (active) setLoaded({ uid: user.uid, feels: null }); });
    return () => { active = false; };
  }, [user, getIdToken]);

  const remove = async (id: string) => {
    if (!current?.feels) return;
    const previous = current.feels;
    setLoaded({ ...current, feels: previous.filter(f => f.id !== id) });
    try {
      const token = await getIdToken();
      if (token) await removeMyFeel(token, id);
    } catch {
      setLoaded({ ...current, feels: previous });
    }
  };

  if (!enabled) return <StatusMessage message={t.pageNotFound} action={{ label: t.newSearch, onClick: () => navigate('/') }} />;
  if (authLoading) return <StatusMessage message={t.loadingFeel} />;
  if (!user) return <StatusMessage message={t.myFeelsSignIn} action={{ label: t.signIn, onClick: () => { void signIn(); } }} />;
  if (!current) return <StatusMessage message={t.loadingFeel} />;
  if (!current.feels) return <StatusMessage message={t.errors.generic} tone="error" />;

  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{t.myFeels}</h2>
        <a
          href="/"
          onClick={linkClick('/')}
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#1a1200' }}
        >
          {t.newSearch}
        </a>
      </div>

      {current.feels.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: 'var(--text-muted)' }}>{t.myFeelsEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {current.feels.map((feel, i) => (
            <motion.li
              key={feel.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.04 }}
              className="group relative"
            >
              <a
                href={`/f/${feel.id}`}
                onClick={linkClick(`/f/${feel.id}`)}
                className="rounded-xl p-3 pr-12 flex items-center gap-3"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="w-10 aspect-[2/3] shrink-0 rounded-md overflow-hidden bg-[#0a0a1a]">
                  {feel.posterUrl && <img src={feel.posterUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white leading-snug">{feel.title}</p>
                  {feel.tagline && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{feel.tagline}</p>}
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{dateFormat.format(new Date(feel.createdAt))}</p>
                </div>
              </a>
              <button
                type="button"
                onClick={() => { void remove(feel.id); }}
                aria-label={`${t.remove}: ${feel.title}`}
                title={t.remove}
                className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
