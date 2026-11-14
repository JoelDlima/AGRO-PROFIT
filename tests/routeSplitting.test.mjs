import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("large optional views are loaded only when opened", () => {
  const source = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  for (const page of [
    "Auth", "Onboarding", "Dashboard", "PriceComparison", "Profile", "Forum",
    "ScanHistory", "Chatbot", "CropHealth", "ExportReport", "PriceTrends", "Resources",
  ]) {
    assert.ok(
      source.includes(`lazy(() => import("./pages/${page}"))`),
      `${page} should be lazy loaded`,
    );
  }
  assert.ok(source.includes("<Suspense"), "lazy routes need a loading fallback");
});
