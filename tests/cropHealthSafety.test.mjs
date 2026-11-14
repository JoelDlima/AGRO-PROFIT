import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../src/pages/CropHealth.tsx', import.meta.url), 'utf8');

test('authentication waits for loading and redirects only after all hooks', () => {
  assert.match(source, /const\s*\{\s*user,\s*loading\s*\}\s*=\s*useAuth\(\)/);
  const lastHook = source.lastIndexOf('useCallback(');
  const loadingGate = source.indexOf('if (loading)');
  const redirect = source.indexOf('if (!user) return <Navigate to="/auth" replace />');
  assert.ok(loadingGate > lastHook, 'loading gate must follow all callbacks');
  assert.ok(redirect > loadingGate, 'redirect must wait for auth loading');
});

test('failed provider or diagnosis requests show an error rather than a result', () => {
  assert.match(source, /catch \(error\)\s*\{[\s\S]*?setErrorMsg\(error instanceof Error \? error\.message[\s\S]*?setScanState\('error'\)/);
  assert.match(source, /scanResult && scanState === 'done'/);
  assert.match(source, /await detectCropDisease\(file\)/);
  assert.match(source, /await detectCropHealth\(file\)/);
});

test('the scanner displays an advisory caution', () => {
  assert.match(source, /not a substitute for professional/i);
});

test('hard-coded service dosage and supplemental treatment steps are not presented', () => {
  assert.doesNotMatch(source, /diagnosis\.dosage|step\.timing/);
  assert.match(source, /diagnosis\.treatment\.organic\.slice\(0, 1\)/);
  assert.match(source, /diagnosis\.treatment\.chemical\.slice\(0, 1\)/);
});
