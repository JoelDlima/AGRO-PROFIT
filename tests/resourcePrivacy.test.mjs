import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../src/pages/Resources.tsx", import.meta.url), "utf8");

test("resource cards do not load remote thumbnails or embed video", () => {
  assert.doesNotMatch(source, /img\.youtube\.com|<iframe\b|getYouTubeEmbedUrl/);
  assert.doesNotMatch(source, /<img\b/);
});

test("video links explicitly identify YouTube and use original guide URLs", () => {
  assert.match(source, /href=\{v\.url\}/);
  assert.match(source, /Open on YouTube/);
  assert.match(source, /target="_blank"\s+rel="noopener noreferrer"/);
});

test("authentication redirect follows all Resources hooks", () => {
  const resources = source.slice(source.indexOf("export default function Resources"), source.indexOf("function CropCard"));
  const redirect = resources.indexOf('if (!user) return <Navigate to="/auth" replace />');
  assert.ok(redirect >= 0, "retain the authentication redirect");
  assert.ok(redirect > resources.lastIndexOf("useMemo("), "run all memo hooks before redirect");
  assert.ok(redirect > resources.lastIndexOf("useState("), "run all state hooks before redirect");
  assert.ok(redirect > resources.lastIndexOf("useEffect("), "run all effect hooks before redirect");
});

test("crop search and accessible expansion remain available", () => {
  assert.match(source, /name\.includes\(normalized\) \|\| locals\.includes\(normalized\)/);
  assert.match(source, /aria-expanded=\{open\}/);
});
