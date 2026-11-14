import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { fileURLToPath } from "node:url";

async function loadHook(env) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL("../src/hooks/useMandiPrices.ts", import.meta.url))],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    define: { "import.meta.env": JSON.stringify(env) },
    plugins: [{
      name: "isolate-query-boundaries",
      setup(build) {
        build.onResolve({ filter: /^(@tanstack\/react-query|@\/services\/.*)$/ }, args => ({
          path: args.path,
          namespace: "test-boundary",
        }));
        build.onResolve({ filter: /^@\/lib\/demoConfig$/ }, () => ({
          path: fileURLToPath(new URL("../src/lib/demoConfig.ts", import.meta.url)),
        }));
        build.onLoad({ filter: /.*/, namespace: "test-boundary" }, args => ({
          contents: args.path === "@tanstack/react-query"
            ? "export const useQuery = options => options;"
            : args.path.endsWith("mandiCacheService")
              ? "export const getMandiPricesWithCache = (...args) => globalThis.__mandiTestFetch(...args);"
              : "export const transformToMarketData = record => record;",
        }));
      },
    }],
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}

async function observe(options) {
  const client = new QueryClient();
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  await new Promise(resolve => setImmediate(resolve));
  const result = observer.getCurrentResult();
  unsubscribe();
  client.clear();
  return result;
}

test("offline demo never fetches and exposes an idle empty result", async () => {
  let calls = 0;
  globalThis.__mandiTestFetch = async () => { calls++; return []; };
  try {
    const { useMandiPrices } = await loadHook({});
    const result = await observe(useMandiPrices({ commodity: "Wheat", state: "Punjab" }));
    assert.equal(calls, 0);
    assert.equal(result.data, undefined);
    assert.equal(result.isLoading, false);
    assert.equal(result.error, null);
  } finally {
    delete globalThis.__mandiTestFetch;
  }
});

test("explicit live opt-in preserves fetching and caller gating", async () => {
  const calls = [];
  globalThis.__mandiTestFetch = async (...args) => { calls.push(args); return []; };
  try {
    const { useMandiPrices } = await loadHook({ VITE_ENABLE_LIVE_SERVICES: "true" });
    const result = await observe(useMandiPrices({ commodity: "Wheat", state: "Punjab" }));
    assert.deepEqual(calls, [["Wheat", "Punjab"]]);
    assert.deepEqual(result.data, { records: [], total: 0, count: 0 });
    await observe(useMandiPrices({ commodity: "Wheat", enabled: false }));
    await observe(useMandiPrices({ commodity: "" }));
    assert.equal(calls.length, 1);
  } finally {
    delete globalThis.__mandiTestFetch;
  }
});
