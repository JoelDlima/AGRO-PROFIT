/**
 * API Utility to construct request endpoints.
 * When running in native Capacitor APK (served from localhost or capacitor://)
 * or local dev without serverless runtime, requests to /api are proxied to
 * the production Vercel serverless deployment.
 * On live web (Vercel), requests remain same-origin (/api/...).
 */
export function getApiUrl(path: string): string {
  if (!path) return '';

  const isNativeOrLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:');

  if (isNativeOrLocal && path.startsWith('/api')) {
    return `https://agro-profit-pro.vercel.app${path}`;
  }

  return path;
}
