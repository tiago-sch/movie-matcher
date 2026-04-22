import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Locale, type T } from './translations';

interface LocaleContext {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: T;
}

const Ctx = createContext<LocaleContext | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  return (
    <Ctx.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
