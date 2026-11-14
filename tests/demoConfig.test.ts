import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';
import { liveServicesEnabled, requireLiveService } from '../src/lib/demoConfig.ts';

test('live services require explicit opt-in', async () => {
  const modulePath = '../src/lib/demoConfig.ts';
  const config = await import(modulePath).catch(() => null);
  assert.ok(config, 'demo configuration module must exist');
  assert.equal(config.liveServicesEnabled({}), false);
  assert.equal(config.liveServicesEnabled({ VITE_ENABLE_LIVE_SERVICES: 'false' }), false);
  assert.equal(config.liveServicesEnabled({ VITE_ENABLE_LIVE_SERVICES: 'true' }), true);
});

test('unavailable integration throws a clear error without invoking work', async () => {
  const modulePath = '../src/lib/demoConfig.ts';
  const config = await import(modulePath).catch(() => null);
  assert.ok(config, 'demo configuration module must exist');
  assert.throws(() => config.requireLiveService(false, 'Weather'), /Weather.*unavailable/i);
  assert.doesNotThrow(() => config.requireLiveService(true, 'Weather'));
});

test('application does not start background price synchronization', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /backgroundSyncAllCrops/);
});

test('network services explicitly enforce the demo boundary', () => {
  // locationService returns an honest coordinate-only fallback offline instead
  // of throwing, so its contract is covered by offlineLocation.test.mjs.
  for (const service of ['agmarknetService', 'rainfallService', 'weatherService', 'groqService', 'cropDiagnosisService', 'cropHealthService', 'plantIdService']) {
    const source = readFileSync(new URL(`../src/services/${service}.ts`, import.meta.url), 'utf8');
    assert.ok(source.includes('requireLiveService('), `${service} must guard network access`);
  }
});

test('rainfall service does not fabricate fallback records', () => {
  const source = readFileSync(new URL('../src/services/rainfallService.ts', import.meta.url), 'utf8');
  assert.equal(source.includes('fallbackRecord'), false);
});

test('offline service actions reject without network access', async () => {
  let requests = 0;
  const actions: Array<[string, string, unknown[]]> = [
    ['agmarknetService', 'fetchMandiPrices', ['Tomato']],
    ['rainfallService', 'fetchRainfallData', ['Goa']],
    ['weatherService', 'getCurrentWeather', ['Goa']],
    ['groqService', 'sendChatMessage', ['Hello']],
    ['cropDiagnosisService', 'generateDiagnosis', [{}]],
    ['cropHealthService', 'detectCropHealth', [{}]],
    ['plantIdService', 'detectCropDisease', [{}]],
  ];
  for (const [file, action, args] of actions) {
    const source = readFileSync(new URL(`../src/services/${file}.ts`, import.meta.url), 'utf8')
      .replaceAll('import.meta.env', '({})');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
    const sandbox = {
      exports, console,
      require: (name: string) => {
        if (name === '@/lib/demoConfig') return { liveServicesEnabled, requireLiveService };
        if (name === '@/integrations/supabase/client') return { supabaseLiveEnabled: false };
        if (name === '@/lib/api') return { getApiUrl: (url: string) => url };
        throw new Error(`Unexpected dependency: ${name}`);
      },
      fetch: () => { requests++; throw new Error('Unexpected network request'); },
    };
    vm.runInNewContext(js, sandbox);
    await assert.rejects(exports[action](...args), /unavailable/i, `${file} must report unavailable`);
  }
  assert.equal(requests, 0);
});

test('Supabase initializes without credentials and OAuth fails without redirect', async () => {
  const source = readFileSync(new URL('../src/integrations/supabase/client.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.env', '({})');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: Record<string, any> = {};
  vm.runInNewContext(js, {
    exports, URL, console, setTimeout, clearTimeout,
    require: (name: string) => {
      if (name === '@/lib/demoConfig') return { liveServicesEnabled };
      if (name === '@supabase/supabase-js') return { createClient };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  assert.equal(exports.supabaseLiveEnabled, false);
  const { data } = await exports.supabase.auth.getSession();
  assert.equal(data.session, null);
  const oauth = await exports.supabase.auth.signInWithOAuth({ provider: 'google' });
  assert.match(oauth.error.message, /unavailable/i);
  assert.equal(oauth.data.url, null);
});
