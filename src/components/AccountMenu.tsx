import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/context';
import { useLocale } from '../i18n/context';
import { linkClick } from '../lib/router';

const pill = 'px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors';
const pillStyle = { border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' };

export function AccountMenu() {
  const { t } = useLocale();
  const { enabled, loading, user, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!enabled || loading) return null;

  if (!user) {
    return (
      <button type="button" onClick={() => { void signIn(); }} className={pill} style={pillStyle}>
        {t.signIn}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={user.name ?? t.myFeels}
        className="w-7 h-7 rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-xs font-semibold"
        style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--accent)' }}
      >
        {user.photoUrl
          ? <img src={user.photoUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          : (user.name?.[0] ?? '•')}
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 z-20 min-w-40 rounded-xl p-1.5 flex flex-col text-sm text-left"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <a
            href="/me"
            onClick={e => { setOpen(false); linkClick('/me')(e); }}
            className="px-3 py-2 rounded-lg hover:bg-white/5"
            style={{ color: 'var(--text)' }}
          >
            {t.myFeels}
          </a>
          <button
            type="button"
            onClick={() => { setOpen(false); void signOut(); }}
            className="px-3 py-2 rounded-lg hover:bg-white/5 text-left cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
