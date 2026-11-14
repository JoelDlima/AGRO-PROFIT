import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/pages/PriceTrends.tsx", import.meta.url), "utf8");

test("trends use recorded history rather than fabricated cached-price points", () => {
  assert.doesNotMatch(source, /Math\.sin|cachedPrices|getMandiPricesWithCache|getCachedPrices/);
  assert.match(source, /getPriceHistory\(/);
  assert.match(source, /record\.recorded_date/);
  assert.match(source, /<AreaChart data=\{trendData\}>/);
});

test("historical movement is not used to direct future selling decisions", () => {
  assert.doesNotMatch(source, /Best Time to Sell|Consider holding|Consider selling|avoid further losses/i);
  assert.match(source, /past prices do not predict future prices/i);
});

test("missing history is explained without presenting zero as a price", () => {
  assert.match(source, /insufficient or unavailable historical data/i);
  assert.match(source, /hasData && !loading && \(/);
  assert.doesNotMatch(source, /automatically syncs prices every 12 hours|Data will appear after the first sync/i);
});
