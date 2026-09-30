/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function harness(onSave) {
  const values = []; let index = 0; const ref = { current: false }; const exports = {};
  const code = ts.transpileModule(fs.readFileSync(__dirname + "/EditorPhotoDescription.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require(name) {
    if (name === "react") return { useId: () => "id", useRef: () => ref, useState(initial) { const id = index++; if (!(id in values)) values[id] = initial; return [values[id], value => { values[id] = value; }]; } };
    if (name === "next-intl") return { useTranslations: () => key => key };
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    return new Proxy({}, { get: (_, key) => key });
  } });
  function nodes(node) { return !node || typeof node !== "object" ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)]; }
  return () => { index = 0; return nodes(exports.default({ value: "Original", onSave })); };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
test("cancel discards draft; Apply commits once even if clicked twice", async () => {
  const saved = [];
  const render = harness(async value => saved.push(value));
  render().find(node => node.type === "Button").props.onClick();
  render().find(node => node.type === "Textarea").props.onChange({ target: { value: "Draft" } });
  render().find(node => node.type === "Button" && node.props.children === "cancel").props.onClick();
  assert.equal(saved.length, 0);
  render().find(node => node.type === "Button").props.onClick();
  assert.equal(render().find(node => node.type === "Textarea").props.value, "Original");
  render().find(node => node.type === "Textarea").props.onChange({ target: { value: "Updated" } });
  const apply = render().find(node => node.type === "Button" && node.props.children === "save");
  apply.props.onClick(); apply.props.onClick(); await tick();
  assert.deepEqual(saved, ["Updated"]);
  assert.equal(render().find(node => node.type === "Dialog").props.open, false);
});
test("failed save preserves draft and leaves dialog open for retry", async () => {
  const render = harness(async () => { throw new Error("failed"); });
  render().find(node => node.type === "Button").props.onClick();
  render().find(node => node.type === "Textarea").props.onChange({ target: { value: "Keep this" } });
  render().find(node => node.type === "Button" && node.props.children === "save").props.onClick(); await tick();
  assert.equal(render().find(node => node.type === "Dialog").props.open, true);
  assert.equal(render().find(node => node.type === "Textarea").props.value, "Keep this");
  assert.ok(render().some(node => node.props.role === "alert"));
});
