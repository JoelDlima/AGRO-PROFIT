import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { liveServicesEnabled } from "../src/lib/demoConfig.ts";

function loadLocationService() {
  const source = readFileSync(new URL("../src/services/locationService.ts", import.meta.url), "utf8")
    .replaceAll("import.meta.env", "({})");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  let requests = 0;
  vm.runInNewContext(js, {
    exports,
    console,
    navigator: {},
    fetch: () => {
      requests++;
      throw new Error("Unexpected network request");
    },
    require: (name) => {
      if (name === "@/lib/demoConfig") return { liveServicesEnabled };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return { exports, requests: () => requests };
}

test("offline reverse geocoding keeps coordinates without a network request", async () => {
  const { exports, requests } = loadLocationService();
  const location = await exports.reverseGeocode(19.75, 75.71);

  assert.equal(location.latitude, 19.75);
  assert.equal(location.longitude, 75.71);
  assert.equal(location.displayName, "Unknown location");
  assert.equal(requests(), 0);
});

test("reverse geocoding source is gated by the live-services flag", () => {
  const source = readFileSync(new URL("../src/services/locationService.ts", import.meta.url), "utf8");
  assert.match(source, /liveServicesEnabled\(import\.meta\.env\)/);
});
