import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("first visit uses the light theme while preserving an explicit dark preference", () => {
  const source = readFileSync(new URL("../src/hooks/useTheme.tsx", import.meta.url), "utf8");
  assert.match(source, /saved === ["']dark["'] \? ["']dark["'] : ["']light["']/);
});
