import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crops } from "../src/data/mockData.ts";

const source = readFileSync(new URL("../src/pages/PriceTrends.tsx", import.meta.url), "utf8");

function pageCropValues(selectedCrop) {
  const cropDataById = crops.find((crop) => crop.id === selectedCrop);
  const selectedCropData = cropDataById || crops.find((crop) => crop.name === selectedCrop);
  const historyArgument = source.match(/getPriceHistory\(([^,]+),/)[1].trim();
  const selectArgument = source.match(/<Select value=\{([^}]+)\} onValueChange=\{setSelectedCrop\}/)[1].trim();
  const declarations = source.match(/const cropName = ([^;]+);/)?.[1];
  const evaluate = (expression) => Function(
    "selectedCrop", "selectedCropData",
    `${declarations ? `const cropName = ${declarations};` : ""} return (${expression});`,
  )(selectedCrop, selectedCropData);
  return { history: evaluate(historyArgument), select: evaluate(selectArgument) };
}

test("crop IDs from links and the default resolve to commodity names for history and selection", () => {
  assert.deepEqual(pageCropValues("tomato"), { history: "Tomato", select: "Tomato" });
  assert.deepEqual(pageCropValues("ladyfinger"), { history: "Lady Finger", select: "Lady Finger" });
});

test("crop names and unknown values retain their existing lookup behavior", () => {
  assert.deepEqual(pageCropValues("Onion"), { history: "Onion", select: "Onion" });
  assert.deepEqual(pageCropValues("unknown"), { history: "unknown", select: "unknown" });
});
