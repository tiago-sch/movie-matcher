import { useState } from 'react';
import { motion } from 'framer-motion';
import { SliderInput } from './SliderInput';
import { useLocale } from '../i18n/context';
import { GENRE_KEYS, type GenreKey } from '../i18n/translations';
import type { MoodInputs } from '../types';

// Mirrors MAX_TEXT_LENGTH in api/recommend.ts — longer texts are rejected by the server
const MAX_TEXT_LENGTH = 500;

const WATCHING_CONTEXT_KEYS = ['alone', 'date night', 'with friends', 'background watch'] as const;
const MENTAL_STATE_KEYS = ['tired', 'curious', 'overstimulated', 'emotional', 'elevated'] as const;

type ContextKey = typeof WATCHING_CONTEXT_KEYS[number];
type StateKey = typeof MENTAL_STATE_KEYS[number];

interface MoodFormProps {
  onSubmit: (mood: MoodInputs) => void;
  /** Pre-fills the form, e.g. when coming back from a result */
  initial?: MoodInputs | null;
  /** Rendered just above the submit button */
  footer?: React.ReactNode;
  isLoading: boolean;
  disabled?: boolean;
}

export function MoodForm({ onSubmit, initial, footer, isLoading, disabled = false }: MoodFormProps) {
  const { t } = useLocale();
  const [text, setText] = useState(initial?.text ?? '');
  const [sliders, setSliders] = useState(initial?.sliders ?? { energy: 5, tone: 5, pace: 5 });
  const [watchingContext, setWatchingContext] = useState<ContextKey[]>((initial?.watchingContext ?? []) as ContextKey[]);
  const [mentalState, setMentalState] = useState<StateKey | ''>((initial?.mentalState ?? '') as StateKey | '');
  const [genres, setGenres] = useState<GenreKey[]>((initial?.genres ?? []) as GenreKey[]);
  const [sameLanguageOnly, setSameLanguageOnly] = useState(initial?.sameLanguageOnly ?? false);

  const toggleContext = (ctx: ContextKey) => {
    setWatchingContext(prev => prev.includes(ctx) ? prev.filter(c => c !== ctx) : [...prev, ctx]);
  };

  const toggleGenre = (genre: GenreKey) => {
    setGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ text, sliders, watchingContext: [...watchingContext], mentalState, genres: [...genres], sameLanguageOnly });
  };

  const hasInput = text.trim().length > 0 || watchingContext.length > 0 || mentalState !== '' || genres.length > 0;
  const canSubmit = !disabled && hasInput;

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
          maxLength={MAX_TEXT_LENGTH}
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

      {/* Film style */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {t.genresLabel}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{t.genresHint}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRE_KEYS.map(key => {
            const active = genres.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGenre(key)}
                className="px-4 py-2 rounded-full text-sm transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(245,158,11,0.12)' : 'var(--card)',
                  border: `1px solid ${active ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`,
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {t.genres[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {t.languageLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={sameLanguageOnly}
          onClick={() => setSameLanguageOnly(v => !v)}
          className="flex items-center justify-between gap-4 text-left cursor-pointer"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-sm" style={{ color: sameLanguageOnly ? 'var(--text)' : 'var(--text-muted)' }}>{t.sameLanguageOnly}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{t.sameLanguageOnlyHint}</span>
          </span>
          <span
            className="relative shrink-0 w-10 h-6 rounded-full transition-colors"
            style={{
              background: sameLanguageOnly ? 'rgba(245,158,11,0.25)' : 'var(--card)',
              border: `1px solid ${sameLanguageOnly ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`,
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{
                left: sameLanguageOnly ? 'calc(100% - 1.125rem)' : '0.125rem',
                background: sameLanguageOnly ? 'var(--accent)' : 'var(--text-muted)',
              }}
            />
          </span>
        </button>
      </div>

      {footer}

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
