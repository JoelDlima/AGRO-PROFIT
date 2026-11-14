import test from "node:test";
import assert from "node:assert/strict";

const math = await import("../src/lib/priceMath.ts").catch(() => null);

test("calculator math module is available", () => {
  assert.ok(math, "price math implementation is missing");
});

test("market price is converted from quintal to kg only for the matching crop", { skip: !math }, () => {
  assert.equal(math.marketPricePerKg("Wheat", "wheat", 2500), 25);
  assert.equal(math.marketPricePerKg("Wheat", "Rice", 2500), null);
  assert.equal(math.marketPricePerKg("Wheat", "Wheat", undefined), null);
  assert.equal(math.marketPricePerKg("Wheat", "Wheat", 3000), 30);
  assert.equal(math.marketPricePerKg("Rice", "Rice", 1800), 18);
  for (const value of [-1, NaN, Infinity, 0]) {
    assert.equal(math.marketPricePerKg("Wheat", "Wheat", value), null);
  }
});

test("calculates kg, quintals and tonnes at the kg price", { skip: !math }, () => {
  assert.equal(math.calculatePrice("1", "25", "quintal"), 2500);
  assert.equal(math.calculatePrice("100", "25", "kg"), 2500);
  assert.equal(math.calculatePrice("1", "25", "ton"), 25000);
  assert.equal(math.calculatePrice("0.5", "25", "quintal"), 1250);
});

test("rejects invalid, nonpositive, nonfinite and overflowing inputs", { skip: !math }, () => {
  for (const value of ["", "-1", "0", "NaN", "Infinity", "3abc", "1e999"]) {
    assert.equal(math.calculatePrice(value, "25", "kg"), null);
    assert.equal(math.calculatePrice("1", value, "kg"), null);
  }
  assert.equal(math.calculatePrice("1e308", "1e308", "ton"), null);
  assert.equal(math.calculatePrice("1", "25", "unknown"), null);
});
