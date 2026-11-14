/** Live integrations are disabled unless explicitly enabled at build time. */
export function liveServicesEnabled(env: Record<string, unknown>): boolean {
  return env.VITE_ENABLE_LIVE_SERVICES === 'true';
}

export function requireLiveService(enabled: boolean, service: string): void {
  if (!enabled) throw new Error(`${service} is unavailable in offline demo mode.`);
}
