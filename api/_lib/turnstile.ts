import { isAllowedHostname } from './hosts.js';

export type CaptchaResult = 'ok' | 'misconfigured' | 'rejected' | 'network-error';

export function captchaConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyCaptcha(token: string | undefined, remoteIp?: string): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return 'misconfigured';
  if (!token) return 'rejected';

  interface SiteVerify { success?: boolean; hostname?: string; 'error-codes'?: string[] }
  let data: SiteVerify;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
    });
    if (!res.ok) return 'network-error';
    data = await res.json() as SiteVerify;
  } catch {
    return 'network-error';
  }

  // A valid token solved on someone else's site (with our site key) must not be accepted
  if (data.success) return isAllowedHostname(data.hostname) ? 'ok' : 'rejected';
  const codes = data['error-codes'] ?? [];
  if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) return 'misconfigured';
  return 'rejected';
}
