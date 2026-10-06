export const TURNSTILE_SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '';

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  appearance?: 'always' | 'execute' | 'interaction-only';
  execution?: 'render' | 'execute';
  callback?: (token: string) => void;
  'error-callback'?: (code?: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

interface Turnstile {
  render: (el: HTMLElement, opts: TurnstileRenderOptions) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window { turnstile?: Turnstile; onTurnstileLoad?: () => void }
}

let loader: Promise<Turnstile> | null = null;

export function loadTurnstile(): Promise<Turnstile> {
  if (loader) return loader;
  if (!TURNSTILE_SITE_KEY) return Promise.reject(new Error('VITE_TURNSTILE_SITE_KEY is not set'));
  if (window.turnstile) return (loader = Promise.resolve(window.turnstile));

  loader = new Promise((resolve, reject) => {
    window.onTurnstileLoad = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile failed to initialise'));
    };
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    script.async = true;
    script.onerror = () => { loader = null; reject(new Error('Failed to load Turnstile script')); };
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * Mounts an invisible (interaction-only) Turnstile widget into `container` and
 * returns a `getToken` function that runs a challenge on demand, plus `destroy`.
 */
export async function mountTurnstile(container: HTMLElement): Promise<{
  getToken: () => Promise<string>;
  destroy: () => void;
}> {
  const ts = await loadTurnstile();
  let pending: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  const id = ts.render(container, {
    sitekey: TURNSTILE_SITE_KEY,
    theme: 'dark',
    appearance: 'interaction-only',
    execution: 'execute',
    callback: token => { pending?.resolve(token); pending = null; },
    'error-callback': code => { pending?.reject(new Error(`Turnstile error ${code ?? ''}`)); pending = null; },
    'expired-callback': () => { pending?.reject(new Error('Turnstile token expired')); pending = null; },
    'timeout-callback': () => { pending?.reject(new Error('Turnstile timed out')); pending = null; },
  });

  return {
    getToken: () => new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        if (pending?.resolve === wrappedResolve) { pending = null; reject(new Error('Turnstile timed out')); }
      }, 30_000);
      const wrappedResolve = (t: string) => { window.clearTimeout(timer); resolve(t); };
      const wrappedReject = (e: Error) => { window.clearTimeout(timer); reject(e); };
      pending = { resolve: wrappedResolve, reject: wrappedReject };
      ts.reset(id);
      ts.execute(id);
    }),
    destroy: () => { try { ts.remove(id); } catch { /* already gone */ } },
  };
}
