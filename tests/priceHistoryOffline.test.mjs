import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { liveServicesEnabled } from "../src/lib/demoConfig.ts";

test("offline price-history lookup returns empty without calling Supabase or logging", async () => {
  const source = readFileSync(new URL("../src/services/forumService.ts", import.meta.url), "utf8")
    .replaceAll("import.meta.env", "({})");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const errors = [];
  let fromCalls = 0;
  const exports = {};
  vm.runInNewContext(js, {
    exports,
    console: { ...console, error: (...args) => errors.push(args) },
    require: (name) => {
      if (name === "@/lib/demoConfig") return { liveServicesEnabled };
      if (name === "@/integrations/supabase/client") {
        return {
          supabase: {
            from: () => {
              fromCalls++;
              throw new Error("Supabase is unavailable in offline demo mode.");
            },
          },
        };
      }
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });

  const result = await exports.getPriceHistory("Tomato");
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 0);
  assert.equal(fromCalls, 0);
  assert.equal(errors.length, 0);
});
