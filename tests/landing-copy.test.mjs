import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("landing does not claim old APIs are live in demo mode", () => {
  const source = readFileSync(new URL("../src/pages/Landing.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /live APIs active/i);
});
