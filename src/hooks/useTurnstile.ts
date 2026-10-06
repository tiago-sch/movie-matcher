import { useEffect, useRef, useCallback } from 'react';
import { mountTurnstile } from '../api/turnstile';

type TurnstileApi = Awaited<ReturnType<typeof mountTurnstile>>;

/**
 * Keeps one invisible Turnstile widget mounted for the lifetime of the app so
 * any action (first search, "load more") can request a fresh token.
 */
export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TurnstileApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;
    mountTurnstile(containerRef.current)
      .then(api => { if (cancelled) api.destroy(); else { apiRef.current = api; destroy = api.destroy; } })
      .catch(() => { /* surfaced on submit */ });
    return () => { cancelled = true; destroy?.(); apiRef.current = null; };
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return apiRef.current ? await apiRef.current.getToken() : null;
    } catch {
      return null;
    }
  }, []);

  return { containerRef, getToken };
}
