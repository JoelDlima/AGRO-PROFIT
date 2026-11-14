import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("shared layout offers a keyboard skip link to its main content", () => {
  const source = readFileSync(new URL("../src/components/layout/AppLayout.tsx", import.meta.url), "utf8");
  assert.match(source, /href="#main-content"/);
  assert.match(source, /<main id="main-content"/);
});
