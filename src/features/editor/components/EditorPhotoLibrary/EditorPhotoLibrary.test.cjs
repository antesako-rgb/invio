/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
function compile(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require(name) {
    if (mocks[name]) return mocks[name];
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name.endsWith(".css")) return { default: {} };
    return new Proxy({}, { get: (_, key) => key });
  } });
  return exports;
}
function nodes(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
}
test("library selection and deletion remain distinct; deletion protection is adapter controlled", () => {
  const Tile = compile(__dirname + "/EditorLibraryPhoto.tsx").default;
  const events = [];
  const props = { selectable: true, selected: false, isUsed: true, usageBadge: "3x", onSelect: () => events.push("select"), onDelete: () => events.push("delete"), deleteDisabled: true };
  const tree = nodes(Tile(props));
  tree.find(node => node.type === "button").props.onClick();
  assert.deepEqual(events, ["select"]);
  assert.equal(tree.find(node => node.type === "Button").props.disabled, true);
  assert.ok(!nodes(Tile({ ...props, onDelete: undefined })).some(node => node.type === "Button"));
  const album = nodes(Tile({ ...props, deleteDisabled: false }));
  album.find(node => node.type === "Button").props.onClick();
  assert.deepEqual(events, ["select", "delete"]);
});
test("Invitation counts concrete usages and protects retained placements independently", () => {
  const { getInvitationPhotoUsage } = compile(path.resolve(__dirname, "../../../invitations/utils/invitationPhotoUsage.ts"));
  const result = getInvitationPhotoUsage([
    { photos: [{ photoId: "a" }, { photoId: "b" }, { photoId: null }] },
    { photos: [{ photoId: "a" }], unplacedPhotos: [{ photoId: "c" }] },
  ]);
  assert.equal(result.usage.a, 2);
  assert.equal(result.usage.b, 1);
  assert.equal(result.usage.c, undefined);
  assert.equal(result.retained.has("c"), true);
});
test("existing-photo picker excludes membership, deduplicates pages and submits selected IDs once", async () => {
  const state = []; const refs = []; let cursor = 0; let refCursor = 0; let effect;
  const react = {
    useState(initial) { const id = cursor++; if (!(id in state)) state[id] = initial; return [state[id], value => { state[id] = typeof value === "function" ? value(state[id]) : value; }]; },
    useRef(initial) { const id = refCursor++; return refs[id] ?? (refs[id] = { current: initial }); },
    useEffect(fn) { effect ??= fn; },
  };
  const Picker = compile(path.resolve(__dirname, "../EditorExistingPhotosPicker/EditorExistingPhotosPicker.tsx"), { react }).default;
  const calls = []; const added = [];
  const props = { excludedIds: ["owned"], onBack() {}, labels: { add: "add", more: "more", select: String },
    loadPage: async offset => { calls.push(offset); return offset === 0 ? { photos: [{ id: "owned" }, { id: "a" }], nextOffset: 50 } : { photos: [{ id: "a" }, { id: "b" }], nextOffset: null }; },
    onAdd: async ids => { added.push([...ids]); },
  };
  const render = () => { cursor = 0; refCursor = 0; return nodes(Picker(props)); };
  render(); effect(); await new Promise(resolve => setImmediate(resolve));
  let tree = render();
  assert.equal(tree.filter(node => node.type === "default").length, 1);
  tree.find(node => node.type === "default").props.onSelect();
  await tree.find(node => node.type === "Button" && node.props.children === "more").props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  tree = render();
  assert.equal(tree.filter(node => node.type === "default").length, 2);
  tree.filter(node => node.type === "default")[1].props.onSelect();
  tree = render();
  const submit = tree.filter(node => node.type === "Button").at(-1);
  await submit.props.onClick();
  assert.deepEqual(calls, [0, 50]);
  assert.deepEqual(added, [["a", "b"]]);
});

test("usage dialog navigates placements and requires confirmation before deleting; failure allows retry", async () => {
  let confirm = false; let deletes = 0; const navigation = [];
  const Usage = compile(path.resolve(__dirname, "../EditorPhotoUsageDialog/EditorPhotoUsageDialog.tsx"), {
    react: { useState: () => [confirm, value => { confirm = value; }] },
  }).default;
  const props = { references: [{ id: "a", label: "Page 1" }], labels: { removeAll: "remove", cancel: "cancel" },
    deleting: true, busy: false, onClose() {}, onNavigate: id => navigation.push(id),
    onDelete: async () => { deletes++; return deletes > 1; },
  };
  let tree = nodes(Usage(props));
  tree.find(node => node.type === "Button").props.onClick();
  assert.deepEqual(navigation, ["a"]);
  tree.filter(node => node.type === "Button").at(-1).props.onClick();
  assert.equal(deletes, 0);
  assert.equal(confirm, true);
  tree = nodes(Usage(props));
  await tree.find(node => node.props.variant === "danger").props.onConfirm();
  assert.equal(confirm, true);
  await tree.find(node => node.props.variant === "danger").props.onConfirm();
  assert.equal(confirm, false);
  assert.equal(deletes, 2);
});
test("Invitation usage locations include repeated and retained slots with stable navigation IDs", () => {
  const { getInvitationPhotoReferences } = compile(path.resolve(__dirname, "../../../invitations/utils/invitationPhotoUsage.ts"));
  const refs = getInvitationPhotoReferences([
    { id: "p1", photos: [{ id: "s1", photoId: "a" }, { id: "s2", photoId: "a" }] },
    { id: "p2", photos: [{ id: "s3", photoId: "b" }], unplacedPhotos: [{ id: "s4", photoId: "a" }] },
  ], "a");
  assert.equal(refs.length, 3);
  assert.equal(refs[2].retained, true);
  assert.equal(refs[2].pageId, "p2");
  assert.equal(refs[2].pageNumber, 2);
});
