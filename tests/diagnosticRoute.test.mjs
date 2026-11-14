import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("public app does not expose a live-service diagnostic route", () => {
  const source = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.ok(!source.includes('path="/api-test"'), "diagnostic endpoint must not be publicly routable");
});
