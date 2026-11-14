import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const serviceSource = await readFile(new URL("../src/services/forumService.ts", import.meta.url), "utf8");
const page = await readFile(new URL("../src/pages/Forum.tsx", import.meta.url), "utf8");
const stub = `const supabase = {
  auth: { getUser: async () => ({ data: { user: null } }) },
  from: () => { throw "offline"; }
};`;
const javascript = ts.transpileModule(
  serviceSource
    .replace('import { supabase } from "@/integrations/supabase/client";', stub)
    .replace(
      'import { liveServicesEnabled } from "@/lib/demoConfig";',
      "const liveServicesEnabled = () => false;",
    ),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
).outputText;
const service = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
const storage = new Map();
globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};

test("offline forum starts empty, including filtered categories and former seed details", async () => {
  storage.clear();
  assert.deepEqual(await service.getForumPosts(), []);
  assert.deepEqual(await service.getForumPosts("weather"), []);
  assert.equal(await service.getForumPost("seed_post_1"), null);
});

test("local posts and replies are identified as local and persist without seeds", async () => {
  storage.clear();
  const post = await service.createForumPost("Question", "How do I start?", "general");
  assert.equal(post.storage, "local");
  assert.deepEqual((await service.getForumPosts()).map((p) => p.id), [post.id]);
  const reply = await service.createComment(post.id, "A local reply");
  assert.equal(reply.storage, "local");
  assert.deepEqual((await service.getForumPost(post.id)).comments.map((c) => c.content), ["A local reply"]);
});

test("forum explains local preview and bases success messages on actual storage", () => {
  assert.match(page, /this browser/i);
  assert.match(page, /not shared/i);
  assert.match(page, /post\.storage\s*===\s*["']local["']/);
  assert.match(page, /comment\.storage\s*===\s*["']local["']/);
  assert.doesNotMatch(page, /Your discussion is now live|<Sparkles[^>]*\/>\s*Live/);
});

test("a failed browser storage write does not report a saved post or reply", async () => {
  const setItem = localStorage.setItem;
  localStorage.setItem = () => { throw new Error("storage unavailable"); };
  try {
    await assert.rejects(service.createForumPost("Question", "Details", "general"), /storage unavailable/);
    await assert.rejects(service.createComment("local_post", "Reply"), /storage unavailable/);
  } finally {
    localStorage.setItem = setItem;
  }
});
