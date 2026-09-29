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
const { parseInvitationDocument } = require("../utils/parseInvitationDocument.ts");
const { createInvitationPage, changeInvitationPageLayout, duplicateInvitationPage, removeInvitationPhotoReferences } = require("../utils/invitationDocumentOperations.ts");
const { InvitationSession } = require("../editor/state/InvitationSession.ts");
const { editorPhotoStyle } = require("../../editor/utils/editorPhotoStyle.ts");

function fixture(framing = {}) {
  const page = changeInvitationPageLayout(createInvitationPage("cover"), "poster");
  page.photos[0] = { ...page.photos[0], photoId: "11111111-1111-4111-8111-111111111111", ...framing };
  return parseInvitationDocument({ theme: "botanical", pages: [page] });
}

test("legacy slots default to centered cover; framing survives JSON persistence", () => {
  assert.deepEqual(editorPhotoStyle(fixture().pages[0].photos[0]), { objectFit: "cover", objectPosition: "50% 50%" });
  const document = fixture({ position: { x: 0, y: 1 }, fit: "contain" });
  assert.deepEqual(parseInvitationDocument(JSON.parse(JSON.stringify(document))), document);
  assert.deepEqual(editorPhotoStyle(document.pages[0].photos[0]), { objectFit: "contain", objectPosition: "0% 100%" });
  for (const framing of [{ position: { x: -0.1, y: .5 } }, { position: { x: .5, y: 1.1 } }, { position: { x: NaN, y: .5 } }, { fit: "stretch" }]) {
    assert.throws(() => fixture(framing));
  }
});

test("duplicate usages retain independent framing; layout changes preserve unplaced framing", () => {
  const document = fixture({ position: { x: .2, y: .8 }, fit: "cover" });
  const duplicate = duplicateInvitationPage(document, document.pages[0].id);
  assert.notEqual(duplicate.pages[0].photos[0].id, duplicate.pages[1].photos[0].id);
  assert.equal(duplicate.pages[0].photos[0].photoId, duplicate.pages[1].photos[0].photoId);
  duplicate.pages[1].photos[0] = { ...duplicate.pages[1].photos[0], position: { x: .7, y: .5 } };
  assert.deepEqual(duplicate.pages[0].photos[0].position, { x: .2, y: .8 });
  const hidden = changeInvitationPageLayout(document.pages[0], "ornamental");
  const restored = changeInvitationPageLayout(hidden, "poster");
  assert.deepEqual(restored.photos[0], document.pages[0].photos[0]);
  assert.deepEqual(removeInvitationPhotoReferences(document, "11111111-1111-4111-8111-111111111111").pages[0].photos[0], { id: document.pages[0].photos[0].id, photoId: null });
});

test("framing commits once and survives save, one-step undo and redo", async () => {
  const document = fixture();
  let saved;
  const session = new InvitationSession(document, 1, 1, async (value, version, revision) => {
    saved = parseInvitationDocument(JSON.parse(JSON.stringify(value)));
    return { document: saved, version, revision: revision + 1 };
  });
  session.commit(value => ({ ...value, pages: value.pages.map(page => ({ ...page, photos: page.photos.map(slot => ({ ...slot, position: { x: .3, y: .9 }, fit: "cover" })) })) }));
  assert.equal(await session.flush(), true);
  assert.deepEqual(saved.pages[0].photos[0].position, { x: .3, y: .9 });
  session.undo();
  assert.equal(session.getSnapshot().canUndo, false);
  assert.equal(session.getSnapshot().document.pages[0].photos[0].position, undefined);
  session.redo();
  assert.deepEqual(session.getSnapshot().document.pages[0].photos[0].position, { x: .3, y: .9 });
  await session.flush();
});

test("real Poster renderer frames only its main usage, with one logical slot", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Poster = require("../components/invitation-renderer/layouts/Poster/Poster.tsx").default;
  const previousCdn = process.env.NEXT_PUBLIC_CDN_URL;
  process.env.NEXT_PUBLIC_CDN_URL = "https://example.test";
  try {
    const page = fixture({ position: { x: .2, y: .8 }, fit: "cover" }).pages[0];
    const html = renderToStaticMarkup(React.createElement(Poster, { page, locale: "hr", photos: new Map([[page.photos[0].photoId, { image_path: "test.jpg", description: "Photo" }]]) }));
    assert.equal(page.photos.length, 1);
    assert.equal((html.match(/<img /g) ?? []).length, 3);
    assert.equal((html.match(/object-position:20% 80%/g) ?? []).length, 1);
    assert.equal((html.match(/data-invitation-photo-slot=/g) ?? []).length, 1);
  } finally {
    if (previousCdn === undefined) delete process.env.NEXT_PUBLIC_CDN_URL;
    else process.env.NEXT_PUBLIC_CDN_URL = previousCdn;
  }
});
