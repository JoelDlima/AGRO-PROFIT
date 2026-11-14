import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const authSource = readFileSync(new URL("../src/hooks/useAuth.tsx", import.meta.url), "utf8");
const profileSource = readFileSync(new URL("../src/hooks/useUserProfile.tsx", import.meta.url), "utf8");
const cropSource = readFileSync(new URL("../src/data/mockData.ts", import.meta.url), "utf8");
const js = ts.transpileModule(authSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const exports = {};
vm.runInNewContext(js, {
  exports,
  require: (name) => {
    if (name === "react") return { createContext: () => ({}) };
    if (name === "react/jsx-runtime") return {};
    if (name === "@capacitor/core") return { Capacitor: {} };
    if (name === "@capacitor/app") return { App: {} };
    if (name === "@/data/mockData") return { crops: [{ name: "Tomato" }, { name: "Onion" }, { name: "Potato" }] };
    if (name === "@/integrations/supabase/client") return { supabase: {} };
    throw new Error(`Unexpected dependency: ${name}`);
  },
});

const normalize = (raw) => JSON.parse(JSON.stringify(exports.readDemoProfile(raw, "demo-id")));

test("new demo profile has three existing crops", () => {
  const profile = normalize(null);
  assert.deepEqual(profile.crops, ["Tomato", "Onion", "Potato"]);
  for (const name of profile.crops) assert.match(cropSource, new RegExp(`name: '${name}'`));
});

test("saved empty and partial selections remain unchanged", () => {
  for (const crops of [[], ["Onion"]]) {
    assert.deepEqual(normalize(JSON.stringify({ crops, full_name: "Farmer" })).crops, crops);
  }
});

test("malformed local data recovers safely", () => {
  for (const raw of ["{", "null", "[]", '"text"', '{"crops":"Tomato"}', '{"crops":[null,3]}']) {
    assert.deepEqual(normalize(raw).crops, ["Tomato", "Onion", "Potato"]);
  }
  const profile = normalize('{"crops":[],"full_name":{},"onboarding_completed":"yes"}');
  assert.equal(profile.full_name, "Demo Farmer");
  assert.equal(profile.onboarding_completed, true);
});

test("login and profile loading use the same local recovery without restoring all crops", () => {
  assert.match(authSource, /readDemoProfile\(localStorage\.getItem\('demo_profile'\)/);
  assert.match(profileSource, /readDemoProfile\(localStorage\.getItem\('demo_profile'\)/);
  assert.doesNotMatch(profileSource, /allCropNames|crops\.map/);
});
