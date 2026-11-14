import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const source = path => readFile(new URL(path, root), 'utf8');
const compile = text => ts.transpileModule(text, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const load = text => import(`data:text/javascript;base64,${Buffer.from(compile(text)).toString('base64')}`);

test('every inherited API endpoint fails closed without importing services', async () => {
  const files = (await readdir(new URL('api/', root))).filter(f => f.endsWith('.ts'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const text = await source(`api/${file}`);
    const parsed = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    assert.equal(parsed.statements.some(ts.isImportDeclaration), false, `${file} imports services`);
    assert.equal(/\bfetch\s*\(|process\.env/.test(text), false, `${file} can access inherited services`);
    const handler = (await load(text)).default;
    for (const method of ['GET', 'POST', 'OPTIONS']) {
      let status;
      let body;
      const res = { status(value) { status = value; return this; }, json(value) { body = value; return this; } };
      await handler({ method }, res);
      assert.equal(status, 503, `${file} ${method}`);
      assert.deepEqual(body, { error: 'Service unavailable' }, `${file} ${method}`);
    }
  }
});

test('API URLs stay relative on native, local, and web clients', async () => {
  const { getApiUrl } = await load(await source('src/lib/api.ts'));
  for (const location of [
    { hostname: 'localhost', protocol: 'http:' },
    { hostname: 'localhost', protocol: 'capacitor:' },
    { hostname: 'example.test', protocol: 'https:' },
  ]) {
    globalThis.window = { location };
    assert.equal(getApiUrl('/api/weather'), '/api/weather');
  }
  delete globalThis.window;
});

test('native auth does not log callback URLs or tokens', async () => {
  const text = await source('src/hooks/useAuth.tsx');
  const parsed = ts.createSourceFile('useAuth.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const logs = [];
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(parsed) === 'console') logs.push(node.getText(parsed));
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  assert.ok(logs.every(log => !/event\.url|redirectUrl|accessToken|refreshToken/i.test(log)));
  assert.match(text, /loginAsDemo/);
});
