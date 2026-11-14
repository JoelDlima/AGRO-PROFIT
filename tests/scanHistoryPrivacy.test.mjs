import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { safeScanImageUrl } from "../src/lib/scanImageSafety.ts";

const origin = "https://app.example";
const noFetch = () => { throw new Error("unexpected fetch"); };

test("only explicitly safe raster data and local paths are accepted", async () => {
  for (const value of ["data:image/png;base64,aGVsbG8="]) {
    assert.equal(await safeScanImageUrl(value, origin, noFetch), value);
  }
  for (const value of [
    "https://evil.example/a.png", "//evil.example/a.png", "/\\evil.example/a.png",
    "javascript:alert(1)", "data:image/svg+xml;base64,PHN2Zz4=", "/images/a.svg",
    "/images/a.png?redirect=https://evil.example", "/images/../a.png",
    "/images/%2e%2e/a.png", " data:image/png;base64,aGVsbG8=", "/images/a.png#x",
  ]) {
    assert.equal(await safeScanImageUrl(value, origin, noFetch), null, value);
  }
});

test("local paths cannot redirect or serve an active image under a raster extension", async () => {
  const calls = [];
  const fetchLocal = async (url, options) => {
    calls.push([url, options]);
    return new Response(new Blob(["x"], { type: "image/png" }));
  };
  const url = await safeScanImageUrl("/images/crop.png", origin, fetchLocal);
  assert.ok(url?.startsWith("blob:"));
  URL.revokeObjectURL(url);
  assert.equal(calls[0][1].redirect, "error");
  assert.equal(await safeScanImageUrl("/images/crop.png", origin, async () => new Response(new Blob(["<svg/>"], { type: "image/svg+xml" }))), null);
  assert.equal(await safeScanImageUrl("/images/crop.png", origin, async () => { throw Error("redirect"); }), null);
});

test("blob previews require a same-origin object URL and a raster MIME type", async () => {
  const url = `blob:${origin}/12345678-1234-1234-1234-123456789abc`;
  const raster = async () => new Response(new Blob(["x"], { type: "image/png" }));
  const svg = async () => new Response(new Blob(["<svg/>"], { type: "image/svg+xml" }));
  assert.equal(await safeScanImageUrl(url, origin, raster), url);
  assert.equal(await safeScanImageUrl(url, origin, svg), null);
  assert.equal(await safeScanImageUrl("blob:https://evil.example/12345678-1234-1234-1234-123456789abc", origin, noFetch), null);
  assert.equal(await safeScanImageUrl(url, origin, async () => { throw Error("revoked"); }), null);
});

test("both preview locations use the safety component and auth waits before redirect", () => {
  const source = readFileSync(new URL("../src/pages/ScanHistory.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /src=\{(?:selectedScan|scan)\.image_url\}/);
  assert.match(source, /<ScanImage[^>]*imageUrl=\{scan\.image_url\}/);
  assert.match(source, /<ScanImage[^>]*imageUrl=\{selectedScan\.image_url\}/);
  const component = source.slice(source.indexOf("export default function ScanHistory"));
  const redirect = component.indexOf('if (!user) return <Navigate');
  assert.ok(redirect > component.indexOf("useEffect("));
  assert.ok(component.indexOf("if (authLoading)") < redirect);
  assert.match(source, /deleteScan\(scanId, user\?\.id\)/);
  assert.match(source, /clearScanHistory\(user\?\.id\)/);
});
