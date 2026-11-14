import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { liveServicesEnabled } from '@/lib/demoConfig';

// Only the public Supabase client credential belongs in browser configuration.
// This switch is a demo boundary, not an authorization or production security control.
const url = import.meta.env.VITE_LIVE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_LIVE_SUPABASE_PUBLISHABLE_KEY;
export const supabaseLiveEnabled = liveServicesEnabled(import.meta.env) && !!url && !!publicKey;

const client = createClient<Database>(
  supabaseLiveEnabled ? url : 'https://offline.invalid',
  supabaseLiveEnabled ? publicKey : 'offline-demo',
  {
    auth: { persistSession: supabaseLiveEnabled, autoRefreshToken: supabaseLiveEnabled, detectSessionInUrl: supabaseLiveEnabled },
    ...(!supabaseLiveEnabled ? { global: { fetch: async () => { throw new Error('Supabase is unavailable in offline demo mode.'); } } } : {}),
  }
);

// OAuth redirects without calling fetch, so disable it separately in offline mode.
const offlineAuth = new Proxy(client.auth, {
  get(target, property) {
    if (property === 'signInWithOAuth') return async () => ({ data: { provider: null, url: null }, error: new Error('Sign-in is unavailable in offline demo mode.') });
    const value = Reflect.get(target, property, target);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
export const supabase = supabaseLiveEnabled ? client : new Proxy(client, {
  get(target, property) {
    if (property === 'auth') return offlineAuth;
    const value = Reflect.get(target, property, target);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
