import { useSyncExternalStore } from 'react';

// Minimal history-based router: the app only has a handful of paths.
const NAV_EVENT = 'feelpick:navigate';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

export function navigate(path: string, { replace = false } = {}) {
  if (path === window.location.pathname) return;
  if (replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.scrollTo({ top: 0 });
  window.dispatchEvent(new Event(NAV_EVENT));
}

export type Route =
  | { name: 'home' }
  | { name: 'feel'; id: string }
  | { name: 'my-feels' }
  | { name: 'not-found' };

export function matchRoute(path: string): Route {
  if (path === '/' || path === '') return { name: 'home' };
  if (path === '/me' || path === '/me/') return { name: 'my-feels' };
  const feel = /^\/f\/([a-zA-Z0-9]{6,20})\/?$/.exec(path);
  if (feel) return { name: 'feel', id: feel[1] };
  return { name: 'not-found' };
}

/** onClick handler for <a href> that navigates client-side (keeps cmd/ctrl-click working). */
export function linkClick(path: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(path);
  };
}
