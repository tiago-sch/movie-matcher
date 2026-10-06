export type CaptchaResult = 'ok' | 'misconfigured' | 'rejected' | 'network-error';

export function captchaConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyCaptcha(token: string | undefined, remoteIp?: string): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return 'misconfigured';
  if (!token) return 'rejected';

  interface SiteVerify { success?: boolean; 'error-codes'?: string[] }
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

  if (data.success) return 'ok';
  const codes = data['error-codes'] ?? [];
  if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) return 'misconfigured';
  return 'rejected';
}
