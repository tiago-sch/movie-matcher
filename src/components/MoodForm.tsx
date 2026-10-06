import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SliderInput } from './SliderInput';
import { useLocale } from '../i18n/context';
import type { MoodInputs } from '../types';
import { mountTurnstile } from '../api/turnstile';

const WATCHING_CONTEXT_KEYS = ['alone', 'date night', 'with friends', 'background watch'] as const;
const MENTAL_STATE_KEYS = ['tired', 'curious', 'overstimulated', 'emotional'] as const;

type ContextKey = typeof WATCHING_CONTEXT_KEYS[number];
type StateKey = typeof MENTAL_STATE_KEYS[number];

interface MoodFormProps {
  onSubmit: (mood: MoodInputs, captchaToken: string | null) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function MoodForm({ onSubmit, isLoading, disabled = false }: MoodFormProps) {
  const { t } = useLocale();
  const [text, setText] = useState('');
  const [sliders, setSliders] = useState({ energy: 5, tone: 5, pace: 5 });
  const [watchingContext, setWatchingContext] = useState<ContextKey[]>([]);
  const [mentalState, setMentalState] = useState<StateKey | ''>('');
  const captchaRef = useRef<HTMLDivElement>(null);
  const captchaApi = useRef<Awaited<ReturnType<typeof mountTurnstile>> | null>(null);

  useEffect(() => {
    if (!captchaRef.current) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;
    mountTurnstile(captchaRef.current)
      .then(api => { if (cancelled) api.destroy(); else { captchaApi.current = api; destroy = api.destroy; } })
      .catch(() => { /* surfaced on submit */ });
    return () => { cancelled = true; destroy?.(); captchaApi.current = null; };
  }, []);

  const toggleContext = (ctx: ContextKey) => {
    setWatchingContext(prev => prev.includes(ctx) ? prev.filter(c => c !== ctx) : [...prev, ctx]);
  };

  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    const mood: MoodInputs = { text, sliders, watchingContext: [...watchingContext], mentalState };
    // Resolve the Turnstile token while the form (and the widget) is still mounted.
    // A null token lets the server reject the request with a proper captcha error.
    setVerifying(true);
    let token: string | null = null;
    try {
      token = captchaApi.current ? await captchaApi.current.getToken() : null;
    } catch {
      token = null;
    } finally {
      setVerifying(false);
    }
    onSubmit(mood, token);
  };

  const hasInput = text.trim().length > 0 || watchingContext.length > 0 || mentalState !== '';
  const canSubmit = !disabled && hasInput && !verifying;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Mood text */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {t.moodLabel}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.moodPlaceholder}
          rows={4}
          className="w-full resize-none rounded-xl p-3 text-sm leading-relaxed outline-none transition-colors"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', caretColor: 'var(--accent)' }}
          onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Sliders */}
      <div className="rounded-2xl p-5 flex flex-col gap-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {t.slidersLabel}
        </span>
        <SliderInput label={t.energy} leftLabel={t.calm}    rightLabel={t.intense} value={sliders.energy} onChange={v => setSliders(s => ({ ...s, energy: v }))} />
        <SliderInput label={t.tone}   leftLabel={t.hopeful}  rightLabel={t.dark}    value={sliders.tone}   onChange={v => setSliders(s => ({ ...s, tone: v }))} />
        <SliderInput label={t.pace}   leftLabel={t.slow}     rightLabel={t.fast}    value={sliders.pace}   onChange={v => setSliders(s => ({ ...s, pace: v }))} />
      </div>

      {/* Watching context */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {t.watchingContext}
        </span>
        <div className="flex flex-wrap gap-2">
          {WATCHING_CONTEXT_KEYS.map(key => {
            const active = watchingContext.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleContext(key)}
                className="px-4 py-2 rounded-full text-sm transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(245,158,11,0.12)' : 'var(--card)',
                  border: `1px solid ${active ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`,
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {t.contexts[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mental state */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {t.mentalState}
        </span>
        <div className="flex flex-wrap gap-2">
          {MENTAL_STATE_KEYS.map(key => {
            const active = mentalState === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMentalState(active ? '' : key)}
                className="px-4 py-2 rounded-full text-sm transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(20,184,166,0.12)' : 'var(--card)',
                  border: `1px solid ${active ? 'rgba(20,184,166,0.5)' : 'var(--border)'}`,
                  color: active ? 'var(--teal)' : 'var(--text-muted)',
                }}
              >
                {t.states[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Turnstile (invisible unless a challenge is needed) */}
      <div ref={captchaRef} className="flex justify-center empty:hidden" />

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!canSubmit || isLoading || disabled}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        className="w-full py-4 rounded-xl font-semibold text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit && !isLoading ? 'var(--accent)' : 'var(--surface)',
          color: canSubmit && !isLoading ? '#000' : 'var(--text-muted)',
          border: `1px solid ${canSubmit && !isLoading ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        {isLoading ? t.submitting : disabled ? t.apiUnavailable : t.submit}
      </motion.button>
    </motion.form>
  );
}
