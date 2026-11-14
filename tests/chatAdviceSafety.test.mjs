import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const chatbot = await readFile(new URL("../src/pages/Chatbot.tsx", import.meta.url), "utf8");

test("chatbot does not invoke the synthetic recommendation and price forecast service", () => {
  assert.doesNotMatch(chatbot, /getMarketRecommendation|getPricePrediction|aiRecommendationService/);
});

test("chatbot replaces generated advice panels with an official-source notice", () => {
  assert.match(chatbot, /recommendations (?:are )?unavailable/i);
  assert.match(chatbot, /check official sources/i);
  assert.doesNotMatch(chatbot, /ai\.(?:sellImmediately|waitForBetterPrices|sellAtRecommended|7dayForecast|transportCostAnalysis|mandiComparison)/);
  assert.doesNotMatch(chatbot, /(?:recommendation|rec)\.(?:bestMarket|transportCost|netProfit|currentPrice|predictedPrice)/);
});
