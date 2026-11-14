import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const rainfall = await readFile(new URL("../src/components/RainfallWidget.tsx", import.meta.url), "utf8");
const chatbot = await readFile(new URL("../src/pages/Chatbot.tsx", import.meta.url), "utf8");

test("rainfall failure and empty results show an unavailable message", () => {
  const branch = rainfall.match(/if \(error \|\| !data \|\| data\.records\.length === 0\) \{([\s\S]*?)\n  \}/);
  assert.ok(branch, "missing rainfall unavailable branch");
  assert.match(branch[1], /rainfall (?:data )?(?:is )?unavailable/i);
  assert.doesNotMatch(branch[1], /return null/);
});

test("chatbot handles initial weather rejection and does not infer sunshine from missing weather", () => {
  const effect = chatbot.match(/\/\/ Fetch weather data on mount\s*useEffect\(\(\) => \{([\s\S]*?)\n  \}, \[profile\?\.state\]\);/);
  assert.ok(effect, "missing weather initialization effect");
  assert.match(effect[1], /\.catch\(/, "weather initialization must catch rejection");
  assert.match(chatbot, /weather (?:data )?(?:is )?unavailable/i);
  assert.doesNotMatch(chatbot, /weatherData\?\.description\?\.toLowerCase\(\)\.includes\('rain'\) \? 'rainy' : 'sunny'/);
});

test("weather failure does not prevent sending a chat message", () => {
  const send = chatbot.slice(chatbot.indexOf("const handleSend"), chatbot.indexOf("const handleKeyPress"));
  assert.match(send, /catch\s*\([^)]*\)\s*\{[^}]*weather[^}]*unavailable/is);
  assert.match(send, /sendChatMessage\(messageText/);
});

test("chat messages continue rendering as text", () => {
  assert.match(chatbot, /whitespace-pre-wrap">\s*\{message\.content\}/);
  assert.doesNotMatch(chatbot, /dangerouslySetInnerHTML/);
});

test("unverified best-market distance is not presented as a fact", () => {
  assert.doesNotMatch(chatbot, /alternativeMarkets\?\.\[0\]\?\.distance|'45 km'/);
});

test("synthetic recommendation figures are not shown", () => {
  assert.doesNotMatch(chatbot, /getMarketRecommendation|getPricePrediction/);
  assert.match(chatbot, /recommendations are unavailable/i);
});
