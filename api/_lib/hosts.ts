const DEFAULT_HOSTNAMES = ['feelpick.com', 'www.feelpick.com', 'localhost', '127.0.0.1'];

/**
 * Hostnames allowed to call the API. ALLOWED_HOSTNAMES (comma-separated) overrides the
 * defaults; the current Vercel deployment's own URLs are always allowed so previews work.
 */
export function allowedHostnames(): Set<string> {
  const configured = process.env.ALLOWED_HOSTNAMES
    ?.split(',')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean);
  const hosts = new Set(configured?.length ? configured : DEFAULT_HOSTNAMES);
  for (const url of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (url) hosts.add(url.toLowerCase());
  }
  return hosts;
}

export function isAllowedHostname(hostname: string | undefined): boolean {
  return !!hostname && allowedHostnames().has(hostname.toLowerCase());
}

/** True when the Origin header (sent by browsers on every cross-origin and same-origin POST) is ours. */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  try {
    return isAllowedHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}
