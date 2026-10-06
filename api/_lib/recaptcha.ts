export type CaptchaResult = 'ok' | 'misconfigured' | 'rejected' | 'network-error';

const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5');
export const CAPTCHA_ACTION = 'recommend';

export function captchaConfigured(): boolean {
  return !!(process.env.GCP_PROJECT_ID && process.env.RECAPTCHA_API_KEY && process.env.RECAPTCHA_SITE_KEY);
}

export async function verifyCaptcha(token: string | undefined): Promise<CaptchaResult> {
  const projectId = process.env.GCP_PROJECT_ID;
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  if (!projectId || !apiKey || !siteKey) return 'misconfigured';
  if (!token) return 'rejected';

  interface Assessment {
    tokenProperties?: { valid?: boolean; action?: string; invalidReason?: string };
    riskAnalysis?: { score?: number };
  }
  let data: Assessment;
  try {
    const res = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: { token, siteKey, expectedAction: CAPTCHA_ACTION } }),
      },
    );
    if (res.status === 400 || res.status === 401 || res.status === 403) return 'misconfigured';
    if (!res.ok) return 'network-error';
    data = await res.json() as Assessment;
  } catch {
    return 'network-error';
  }

  if (!data.tokenProperties?.valid) return 'rejected';
  if (data.tokenProperties.action !== CAPTCHA_ACTION) return 'rejected';
  if ((data.riskAnalysis?.score ?? 0) < MIN_SCORE) return 'rejected';
  return 'ok';
}
