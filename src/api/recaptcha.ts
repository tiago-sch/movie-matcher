export const RECAPTCHA_SITE_KEY: string = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '';
export const CAPTCHA_ACTION = 'recommend';

interface GrecaptchaEnterprise {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: { enterprise?: GrecaptchaEnterprise };
  }
}

let loader: Promise<GrecaptchaEnterprise> | null = null;

export function loadRecaptcha(): Promise<GrecaptchaEnterprise> {
  if (loader) return loader;
  if (!RECAPTCHA_SITE_KEY) return Promise.reject(new Error('VITE_RECAPTCHA_SITE_KEY is not set'));

  loader = new Promise((resolve, reject) => {
    const finish = () => {
      const ent = window.grecaptcha?.enterprise;
      if (!ent) return reject(new Error('reCAPTCHA Enterprise failed to initialise'));
      ent.ready(() => resolve(ent));
    };
    if (window.grecaptcha?.enterprise) return finish();

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
    script.async = true;
    script.onload = finish;
    script.onerror = () => { loader = null; reject(new Error('Failed to load reCAPTCHA script')); };
    document.head.appendChild(script);
  });
  return loader;
}

export async function getCaptchaToken(): Promise<string> {
  const ent = await loadRecaptcha();
  return ent.execute(RECAPTCHA_SITE_KEY, { action: CAPTCHA_ACTION });
}
