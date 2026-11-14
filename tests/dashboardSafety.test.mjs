import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dashboard = await readFile(new URL("../src/pages/Dashboard.tsx", import.meta.url), "utf8");

test("dashboard does not make unsupported predictions or label unverified prices live", () => {
  assert.doesNotMatch(dashboard, /Tomato prices expected|Consider holding your stock|data\.liveData|Fetching live mandi|3h Sync/i);
  assert.match(dashboard, /Prices may be cached or outdated/i);
  assert.doesNotMatch(dashboard, /dashboard\.(rising|falling|stable)/);
});

test("sample fallback is clearly marked and cannot prefill the calculator", () => {
  assert.match(dashboard, /Sample prices.*not.*current/i);
  assert.match(dashboard, /marketPrice=\{hasRealData && !marketsError \? topMarkets\[0\]\?\.price : undefined\}/);
});

test("weather unavailability and approximate distance are explicit", () => {
  assert.match(dashboard, /!weatherLoading && !weatherData/);
  assert.match(dashboard, /Weather (?:data )?unavailable/i);
  assert.match(dashboard, /straight-line.*approximate/i);
  assert.doesNotMatch(dashboard, /dashboard\.topMarkets|dashboard\.highestPrices|Nearest Mandis for|Nearest First/);
});

test("auth redirect happens after all dashboard hooks", () => {
  assert.ok(dashboard.indexOf("return <Navigate") > dashboard.indexOf("const { data: weatherData"), "redirect precedes weather query hook");
});

test("default crop follows a late profile without setting selection during render", () => {
  assert.match(dashboard, /const activeCropForMarkets = selectedMarketCrop \|\| firstCrop/);
  assert.doesNotMatch(dashboard, /setSelectedMarketCrop\(firstCrop\)/);
});
