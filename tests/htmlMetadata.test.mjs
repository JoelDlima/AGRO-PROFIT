import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("viewport permits pinch zoom", () => {
  assert.ok(!/user-scalable\s*=\s*no/i.test(html), "do not disable user zoom");
  assert.ok(!/maximum-scale\s*=\s*1(?:\.0)?(?:\s|,|")/i.test(html), "do not restrict zoom to 1x");
});

test("preview metadata does not promise live prices or claim an existing deployment", () => {
  assert.ok(!/real-time market prices/i.test(html), "do not promise live market prices");
  assert.ok(!/agro-profit-pro\.vercel\.app/i.test(html), "do not claim a production URL for this preview");
});
