import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformSync } from "esbuild";
import ts from "typescript";

const source = readFileSync(new URL("../src/pages/Chatbot.tsx", import.meta.url), "utf8");
const parsed = ts.createSourceFile("Chatbot.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const messageNodes = [];
function findMessageContent(node) {
  if (ts.isPropertyAccessExpression(node) && node.expression.getText(parsed) === "message" && node.name.text === "content") {
    messageNodes.push(node);
  }
  ts.forEachChild(node, findMessageContent);
}
findMessageContent(parsed);
assert.equal(messageNodes.length, 1, "Expected one rendered message.content reference");
let contentElement = messageNodes[0].parent;
while (contentElement && !ts.isJsxElement(contentElement) && !ts.isJsxSelfClosingElement(contentElement)) {
  contentElement = contentElement.parent;
}
assert.ok(contentElement, "Expected message.content inside a JSX element");
const messageMarkup = contentElement.getText(parsed);
const compiled = transformSync(`function render(message) { return (${messageMarkup}); }`, {
  loader: "tsx",
  jsx: "transform",
}).code;
const renderMessage = new Function("React", `${compiled}\nreturn render;`)(React);

for (const role of ["user", "assistant"]) {
  test(`${role} message displays untrusted markup as text`, () => {
    const payload = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    const html = renderToStaticMarkup(renderMessage({ role, content: payload }));
    assert.ok(html.includes("&lt;img"), html);
    assert.ok(html.includes("&lt;script&gt;"), html);
    assert.doesNotMatch(html, /<img|<script/i);
  });
}
