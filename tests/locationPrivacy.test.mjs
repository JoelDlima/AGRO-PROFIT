import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("location is not reacquired automatically after browser permission was granted", () => {
  const source = readFileSync(new URL("../src/hooks/useLocation.ts", import.meta.url), "utf8");
  assert.ok(!source.includes("navigator.permissions.query"), "do not automatically request location on mount");
  assert.equal((source.match(/getCurrentLocation\(\)/g) ?? []).length, 1, "location should only be requested by the explicit action");
});
