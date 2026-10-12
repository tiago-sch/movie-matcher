import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Results } from '../components/Results';
import { StatusMessage } from '../components/StatusMessage';
import { useLocale } from '../i18n/context';
import { cachedFeel, fetchFeel } from '../api/feels';
import { navigate } from '../lib/router';
import type { Feel } from '../types';

type Loaded = { id: string; feel: Feel | null; failed?: boolean };

export function FeelPage({ id }: { id: string }) {
  const { t, setLocale } = useLocale();
  const [loaded, setLoaded] = useState<Loaded | null>(() => {
    const feel = cachedFeel(id);
    return feel ? { id, feel } : null;
  });
  const current = loaded?.id === id ? loaded : null;

  useEffect(() => {
    if (cachedFeel(id)) return;
    let active = true;
    fetchFeel(id)
      .then(feel => {
        if (!active) return;
        // Someone opening a shared link sees the UI in the language the feel was written in
        if (feel) setLocale(feel.locale);
        setLoaded({ id, feel });
      })
      .catch(() => { if (active) setLoaded({ id, feel: null, failed: true }); });
    return () => { active = false; };
  }, [id, setLocale]);

  const feel = current?.feel ?? cachedFeel(id) ?? null;

  useEffect(() => {
    if (!feel) return;
    const previous = document.title;
    document.title = `${feel.results.title} — Feelpick`;
    return () => { document.title = previous; };
  }, [feel]);

  const goHome = () => navigate('/');

  if (feel) {
    return (
      <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Results data={feel.results} feelId={id} onReset={goHome} />
      </motion.div>
    );
  }
  if (!current) return <StatusMessage message={t.loadingFeel} />;
  return (
    <StatusMessage
      message={current.failed ? t.errors.generic : t.feelNotFound}
      tone={current.failed ? 'error' : 'muted'}
      action={{ label: t.newSearch, onClick: goHome }}
    />
  );
}
