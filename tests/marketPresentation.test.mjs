import test from "node:test";
import assert from "node:assert/strict";
import { getMarketPresentation, getPriceSummary } from "../src/lib/marketPresentation.ts";

test("empty results use explicitly synthetic examples even without an error", () => {
  const examples = [{ price: 100 }];
  assert.deepEqual(getMarketPresentation([], examples, false), { source: "demo", markets: examples });
});

test("loading does not present examples as results", () => {
  assert.deepEqual(getMarketPresentation([], [{ price: 100 }], true), { source: "loading", markets: [] });
});

test("returned data is identified as unverified rather than live", () => {
  const records = [{ price: 250 }];
  assert.deepEqual(getMarketPresentation(records, [{ price: 100 }], false), { source: "records", markets: records });
});

test("highest price is independent of distance ordering", () => {
  assert.deepEqual(getPriceSummary([{ price: 100 }, { price: 300 }, { price: 200 }]), {
    highest: 300, average: 200,
  });
});

test("empty price summary has no fabricated zero price", () => {
  assert.deepEqual(getPriceSummary([]), { highest: null, average: null });
});
