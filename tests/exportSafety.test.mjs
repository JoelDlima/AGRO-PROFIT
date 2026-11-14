import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/pages/ExportReport.tsx", import.meta.url), "utf8");
const handler = source.slice(source.indexOf("  const exportToPDF ="), source.indexOf("  const exportToCSV ="));
const compiled = ts.transpile(handler, { target: ts.ScriptTarget.ES2022 });

async function runExport(reportType, currentMarkets, historyData = []) {
  const texts = [];
  const toasts = [];
  const exportingStates = [];
  let saves = 0;
  class PDF {
    internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
    setFontSize() {}
    setTextColor() {}
    text(text) { texts.push(text); }
    getNumberOfPages() { return 1; }
    setPage() {}
    save() { saves++; }
  }
  const createHandler = new Function(
    "setExporting", "jsPDF", "selectedCropData", "reportType", "currentMarkets",
    "getPriceHistory", "autoTable", "translateMarketName", "getDistrictTranslation",
    "getStateTranslation", "language", "toast", "t",
    `${compiled}\nreturn exportToPDF;`,
  );
  const exportPDF = createHandler(
    (value) => exportingStates.push(value), PDF, { name: "Tomato" }, reportType, currentMarkets,
    async () => historyData, () => {}, (value) => value, (value) => value,
    (value) => value, "en", (value) => toasts.push(value), (value) => value,
  );
  await exportPDF();
  return { texts, toasts, saves, exportingStates };
}

test("empty current prices do not produce or claim a successful PDF", async () => {
  const result = await runExport("current", []);
  assert.equal(result.saves, 0);
  assert.equal(result.toasts.some((toast) => toast.title === "export.success"), false);
  assert.equal(result.toasts[0].variant, "destructive");
  assert.deepEqual(result.exportingStates, [true, false]);
});

test("empty historical prices do not produce or claim a successful PDF", async () => {
  const result = await runExport("historical", [], []);
  assert.equal(result.saves, 0);
  assert.equal(result.toasts.some((toast) => toast.title === "export.success"), false);
  assert.equal(result.toasts[0].variant, "destructive");
  assert.deepEqual(result.exportingStates, [true, false]);
});

test("current prices retain their summary and export successfully", async () => {
  const result = await runExport("current", [
    { price: 100, name: "A", district: "D", state: "S", trend: "up" },
    { price: 200, name: "B", district: "D", state: "S", trend: "down" },
  ]);
  assert.equal(result.saves, 1);
  assert.ok(result.texts.includes("Average Price: Rs.150/quintal"));
  assert.ok(result.texts.includes("Lowest Price: Rs.100/quintal"));
  assert.ok(result.texts.includes("Highest Price: Rs.200/quintal"));
  assert.equal(result.toasts.at(-1).title, "export.success");
});

test("report-type descriptions can wrap on a narrow screen", () => {
  const descriptions = [...source.matchAll(/className="text-xs text-left opacity-80([^"]*)"/g)].map((match) => match[1]);
  assert.equal(descriptions.length, 2);
  for (const className of descriptions) {
    assert.match(className, /whitespace-normal/, "descriptions must override the button's nowrap style");
  }
});

test("historical prices still export successfully", async () => {
  const result = await runExport("historical", [], [
    { recorded_date: "2026-01-01", modal_price: 100 },
  ]);
  assert.equal(result.saves, 1);
  assert.ok(result.texts.includes("14-Day Price Trend"));
  assert.equal(result.toasts.at(-1).title, "export.success");
});
