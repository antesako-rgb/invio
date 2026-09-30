/* eslint-disable @typescript-eslint/no-require-imports -- Compile real domain modules for Node tests. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
};
require.extensions[".tsx"] = require.extensions[".ts"];
require.extensions[".css"] = module => { module.exports = { default: {} }; };
const Module = require("node:module");
const path = require("node:path");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith("@/") ? path.resolve(__dirname, "../../..", request.slice(2)) : request, ...args);
};

const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  if (request === "@/styles/fonts/albumMaterialFonts") return "test-fonts";
  return resolve.call(this, request, ...args);
};
require.cache["test-fonts"] = { id: "test-fonts", filename: "test-fonts", loaded: true, exports: { allura: { variable: "script" } } };
process.env.NEXT_PUBLIC_CDN_URL = "https://example.test";
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { invitationLayoutComponents } = require("../components/invitation-renderer/InvitationLayouts.tsx");
const { invitationPageTypes } = require("../config/invitationPageTypes.ts");
const { invitationInlineFields } = require("../config/invitationInlineFields.ts");
const { createInvitationPage, changeInvitationPageLayout } = require("../utils/invitationDocumentOperations.ts");

test("every declared inline field is reachable on an empty page in every compatible layout", () => {
  for (const [type, config] of Object.entries(invitationPageTypes)) {
    for (const layout of config.layouts) {
      const page = changeInvitationPageLayout(createInvitationPage(type), layout);
      const seen = new Set();
      const slots = new Set();
      const presentation = {
        text: (field) => { seen.add(field); return React.createElement("button", null, field); },
        photo: id => { slots.add(id); return React.createElement("button", null, "photo"); },
      };
      renderToStaticMarkup(React.createElement(invitationLayoutComponents[layout], { page, locale: "hr", photos: new Map(), showPhotoPlaceholders: true, presentation }));
      for (const field of invitationInlineFields(page)) assert.ok(seen.has(field), `${type}/${layout}: missing ${field}`);
      assert.equal(slots.size, page.photos.length, `${type}/${layout}: missing photo target`);
    }
  }
});

test("public layouts expose no editing controls or empty text prompts", () => {
  for (const [type, config] of Object.entries(invitationPageTypes)) {
    for (const layout of config.layouts) {
      const page = changeInvitationPageLayout(createInvitationPage(type), layout);
      const html = renderToStaticMarkup(React.createElement(invitationLayoutComponents[layout], { page, locale: "en", photos: new Map() }));
      assert.doesNotMatch(html, /contenteditable|<button|role="dialog"/i, `${type}/${layout}`);
    }
  }
});

test("every Invitation photo layout displays descriptions once per real slot, excluding decorative copies", () => {
  for (const [type, config] of Object.entries(invitationPageTypes)) {
    for (const layout of config.layouts) {
      const page = changeInvitationPageLayout(createInvitationPage(type), layout);
      page.photos = page.photos.map(slot => ({ ...slot, photoId: "asset" }));
      const photos = new Map([["asset", { id: "asset", image_path: "photo.webp", description: "Shared description" }]]);
      const html = renderToStaticMarkup(React.createElement(invitationLayoutComponents[layout], { page, locale: "en", photos }));
      assert.equal((html.match(/<figcaption/g) ?? []).length, page.photos.length, `${type}/${layout}`);
      assert.doesNotMatch(html, /<button|contenteditable/i);
    }
  }
});
