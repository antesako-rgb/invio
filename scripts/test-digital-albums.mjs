import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Execute the actual domain/renderer modules without a Next server or live database.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();
const mocks = {
  "server-only": {},
  "next-intl": { useTranslations: () => (key) => key, useLocale: () => "en" },
  "next/image": ({ src, alt, style }) => React.createElement("img", { src, alt, style }),
  "@/components/ui/dialog/dialog": {
    Dialog: () => null,
    DialogContent: React.Fragment,
    DialogHeader: React.Fragment,
    DialogTitle: React.Fragment,
  },
  "@/components/ui/button": { Button: "button" },
  "@/components/ui/textarea": { Textarea: "textarea" },
};
function load(path) {
  const file = [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`].find(existsSync);
  assert.ok(file, `Missing module: ${path}`);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: file,
  }).outputText;
  const localRequire = (name) => {
    if (name in mocks) return mocks[name];
    if (name.endsWith(".css")) return {};
    if (name.startsWith("@/")) return load(resolve(root, "src", name.slice(2)));
    if (name.startsWith(".")) return load(resolve(dirname(file), name));
    return require(name);
  };
  new Function("require", "module", "exports", code)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const album = (path) => load(resolve(root, "src/features/digital-albums", path));
const { createDefaultDigitalAlbumDocument: create } = album("document/createDefaultDigitalAlbumDocument");
const { parseDigitalAlbumDocument: parse } = album("utils/parseDigitalAlbumDocument");
const { changeDigitalAlbumPageLayout: layout, duplicateDigitalAlbumPage: duplicate, moveDigitalAlbumPage: move, albumPhotoUsage: usage } = album("utils/digitalAlbumDocumentOperations");
const { DigitalAlbumSession: Session } = album("editor/state/DigitalAlbumSession");
const { DigitalAlbumSaveConflict: Conflict } = album("utils/digitalAlbumRevision");
const make = () => create({ eventName: "Our event", eventDate: "2027-06-15" });

for (const placements of [0, 1, 3]) {
  test(`library deletion saves ${placements} placements before membership removal and prevents false undo`, async () => {
    const { deleteDigitalAlbumLibraryPhoto: remove } = album("editor/utils/deleteDigitalAlbumLibraryPhoto");
    const actions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
    const document = make();
    document.pages.flatMap((p) => p.photos).slice(0, placements).forEach((slot) => { slot.photoId = "delete"; });
    if (placements === 3) document.pages[1].unplacedPhotos.push({ id: "retained", photoId: "delete" });
    let persisted = structuredClone(document);
    const members = new Set(["delete"]);
    const session = new Session(document, 2, 1, async (doc, version, revision) => {
      persisted = structuredClone(doc);
      return { document: doc, version, revision: revision + 1 };
    });
    const ops = actions({ activePageId: document.pages[0].id, commit: session.commit });
    const result = await remove("delete", { ...ops, flush: session.flush, clearHistory: session.clearHistory }, async () => {
      assert.equal(usage(persisted, "delete").length, 0);
      assert.equal(session.getSnapshot().canUndo, false);
      members.delete("delete");
      return true;
    });
    assert.equal(result, "deleted");
    assert.equal(members.has("delete"), false);
    session.undo(); session.redo();
    assert.equal(usage(session.getSnapshot().document, "delete").length, 0);
  });
}

test("failed document save never calls membership deletion; retry uses the same session", async () => {
  const { deleteDigitalAlbumLibraryPhoto: remove } = album("editor/utils/deleteDigitalAlbumLibraryPhoto");
  const actions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
  const document = make(); document.pages[0].photos[0].photoId = "delete";
  let fail = true; let deletions = 0;
  const session = new Session(document, 2, 1, async (doc, version, revision) => {
    if (fail) throw new Error("offline");
    return { document: doc, version, revision: revision + 1 };
  });
  const editor = { ...actions({ activePageId: document.pages[0].id, commit: session.commit }), flush: session.flush, clearHistory: session.clearHistory };
  const membership = async () => { deletions++; return true; };
  assert.equal(await remove("delete", editor, membership), "save-failed");
  assert.equal(deletions, 0);
  assert.equal(session.getSnapshot().canUndo, true);
  fail = false;
  assert.equal(await remove("delete", editor, membership), "deleted");
  assert.equal(deletions, 1);
});

test("ambiguous membership failure retains saved removal and irreversible history boundary", async () => {
  const { deleteDigitalAlbumLibraryPhoto: remove } = album("editor/utils/deleteDigitalAlbumLibraryPhoto");
  const calls = [];
  assert.equal(await remove("delete", {
    removePhotoEverywhere: () => calls.push("references"),
    flush: async () => { calls.push("save"); return true; },
    clearHistory: () => calls.push("history"),
  }, async () => { calls.push("membership"); throw new Error("network"); }), "membership-failed");
  assert.deepEqual(calls, ["references", "save", "history", "membership"]);
});

test("library card isolates thumbnail, usage and trash in browse/add/replace modes", () => {
  const Card = album("editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumLibraryPhoto").default;
  for (const mode of ["browse", "add", "replace"]) {
    const calls = [];
    const tree = Card({ selectable: mode !== "browse", selected: false, isUsed: true,
      imageUrl: "photo.webp", selectLabel: "select", deleteLabel: "delete", usageBadge: "3x",
      onSelect: () => calls.push(mode), onDelete: () => calls.push("delete"),
    });
    const [thumbnail, badge, trashWrapper] = React.Children.toArray(tree.props.children);
    assert.equal(tree.props.onClick, undefined);
    assert.equal(thumbnail.props.disabled, mode === "browse");
    assert.deepEqual(calls, []); // Rendering/cancelling without confirmation does nothing.
    if (!thumbnail.props.disabled) thumbnail.props.onClick();
    assert.deepEqual(calls, mode === "browse" ? [] : [mode]);
    assert.equal(badge.type, "span");
    assert.equal(badge.props.onClick, undefined);
    assert.equal(badge.props.tabIndex, undefined);
    assert.equal(calls.includes("delete"), false);
    trashWrapper.props.children.props.onClick();
    assert.equal(calls.at(-1), "delete");
    calls.length = 0;
    if (!thumbnail.props.disabled) thumbnail.props.onClick();
    assert.equal(calls.includes("delete"), false); // No per-card pending delete state.
  }
});

for (const previousPhoto of [null, "previous"]) {
  test(`thumbnail fills/replaces ${previousPhoto ?? "empty"} slot without opening usage or delete`, async () => {
    const Card = album("editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumLibraryPhoto").default;
    const actions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
    const document = make();
    const page = document.pages[2];
    page.photos[0].photoId = previousPhoto;
    const session = new Session(document, 2, 1, async (doc, version, revision) => ({ document: doc, version, revision: revision + 1 }));
    const operations = actions({ activePageId: page.id, commit: session.commit });
    let dialog = null;
    const tree = Card({ selectable: true, selected: false, isUsed: true,
      imageUrl: "photo.webp", selectLabel: "select", usageLabel: "usage", deleteLabel: "delete", usageBadge: "2x",
      onSelect: () => operations.selectPhoto(page.photos[0].id, "new"),
      onUsage: () => { dialog = "usage"; }, onDelete: () => { dialog = "delete"; },
    });
    const [thumbnail, , trash] = React.Children.toArray(tree.props.children);
    trash.props.children.props.onClick();
    assert.deepEqual(session.getSnapshot().document, document);
    dialog = null; // Cancel the controlled dialog without invoking its confirmation.
    thumbnail.props.onClick();
    assert.equal(dialog, null);
    assert.equal(await session.flush(), true);
    const result = session.getSnapshot().document.pages[2];
    assert.deepEqual(result.photos[0], { id: page.photos[0].id, photoId: "new" });
    assert.deepEqual(result.photos[1], page.photos[1]);
    assert.equal(result.layout, page.layout);
    session.undo();
    assert.equal(session.getSnapshot().document.pages[2].photos[0].photoId, previousPhoto);
    session.redo();
    assert.equal(session.getSnapshot().document.pages[2].photos[0].photoId, "new");
    await session.flush();
  });
}

test("photo usage lists every placement, including repeated and retained slots", () => {
  const { getDigitalAlbumPhotoReferences: references } = album("utils/digitalAlbumPhotoReferences");
  const d = make();
  d.pages[2].photos.forEach((slot) => { slot.photoId = "used"; });
  d.pages[4].unplacedPhotos.push({ id: "retained", photoId: "used", caption: "Keep" });
  assert.deepEqual(references(d.pages, "used"), [
    { pageId: d.pages[2].id, pageNumber: 3, slotId: d.pages[2].photos[0].id, retained: false },
    { pageId: d.pages[2].id, pageNumber: 3, slotId: d.pages[2].photos[1].id, retained: false },
    { pageId: d.pages[4].id, pageNumber: 5, slotId: "retained", retained: true },
  ]);
  assert.deepEqual(references(d.pages, "unused"), []);
});

test("remove-all is one revisioned document edit and undo restores crop, caption and retained photos", async () => {
  const { getDigitalAlbumPhotoReferences: references, removeDigitalAlbumPhotoReferences: remove } = album("utils/digitalAlbumPhotoReferences");
  const actions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
  const d = make();
  Object.assign(d.pages[1].photos[0], { photoId: "used", caption: "Caption", position: { x: 0.2, y: 0.8 }, fit: "contain" });
  d.pages[2].photos[0].photoId = "used";
  d.pages[2].photos[1].photoId = "other";
  d.pages[3].unplacedPhotos.push({ id: "retained", photoId: "used", caption: "Retained caption" }, { id: "keep", photoId: "other" });
  const original = structuredClone(d);
  const calls = [];
  const session = new Session(d, 2, 8, async (document, version, revision) => {
    calls.push(revision);
    return { document, version, revision: revision + 1 };
  });
  const operations = actions({ activePageId: d.pages[0].id, commit: session.commit });
  operations.removePhotoEverywhere("used");
  assert.equal(await session.flush(), true);
  const result = session.getSnapshot().document;
  assert.equal(references(result.pages, "used").length, 0);
  assert.deepEqual(result.pages[1].photos[0], { id: d.pages[1].photos[0].id, photoId: null });
  assert.deepEqual(result.pages[2].photos[1], d.pages[2].photos[1]);
  assert.deepEqual(result.pages[3].unplacedPhotos, [{ id: "keep", photoId: "other" }]);
  assert.deepEqual(result.pages.map((page) => [page.id, page.layout, page.content]), d.pages.map((page) => [page.id, page.layout, page.content]));
  assert.deepEqual(d, original);
  assert.deepEqual(calls, [8]);
  session.undo();
  await session.flush();
  assert.deepEqual(session.getSnapshot().document, original);
  session.redo();
  await session.flush();
  assert.deepEqual(session.getSnapshot().document, result);
  assert.deepEqual(remove(result, "unused"), result);
});

test("Photos defaults to library and resolves only an explicitly targeted visible slot", () => {
  const { resolveDigitalAlbumPhotoView: resolveView } = album("editor/utils/resolveDigitalAlbumPhotoView");
  const filled = { id: "selected", photoId: "photo" };
  const empty = { id: "selected", photoId: null };
  assert.equal(resolveView(null, filled, true), "library");
  assert.equal(resolveView({ slotId: filled.id, mode: "context" }, filled, true), "context");
  assert.equal(resolveView({ slotId: empty.id, mode: "pick" }, empty, true), "pick");
  assert.equal(resolveView({ slotId: filled.id, mode: "pick" }, filled, true), "pick");
  // Undo can empty the selected slot; navigation/layout changes can remove it.
  assert.equal(resolveView({ slotId: filled.id, mode: "context" }, empty, true), "pick");
  assert.equal(resolveView({ slotId: filled.id, mode: "pick" }, { id: "fallback", photoId: null }, true), "library");
  assert.equal(resolveView({ slotId: filled.id, mode: "context" }, filled, false), "library");
  assert.equal(resolveView({ slotId: filled.id, mode: "context" }, undefined, true), "library");
});

test("contextual replace and remove retain the page and use existing undo/redo saves", async () => {
  const actions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
  const d = make();
  const page = d.pages[2];
  Object.assign(page.photos[0], { photoId: "original", caption: "Original caption", position: { x: 0.3, y: 0.7 }, fit: "contain" });
  page.photos[1].photoId = "other";
  const session = new Session(d, 2, 1, async (document, version, revision) => ({ document, version, revision: revision + 1 }));
  const operations = actions({ activePageId: page.id, commit: session.commit });
  operations.selectPhoto(page.photos[0].id, "replacement");
  await session.flush();
  assert.deepEqual(session.getSnapshot().document.pages[2].photos[0], { id: page.photos[0].id, photoId: "replacement" });
  assert.deepEqual(session.getSnapshot().document.pages[2].photos[1], page.photos[1]);
  assert.equal(session.getSnapshot().document.pages[2].layout, page.layout);
  session.undo();
  await session.flush();
  assert.deepEqual(session.getSnapshot().document, d);
  session.redo();
  await session.flush();
  operations.removePhotoFromPage(page.photos[0].id);
  await session.flush();
  assert.deepEqual(session.getSnapshot().document.pages[2].photos[0], { id: page.photos[0].id, photoId: null });
  session.undo();
  await session.flush();
  assert.equal(session.getSnapshot().document.pages[2].photos[0].photoId, "replacement");
});

test("visible page context distinguishes cover, spread and mobile single pages", () => {
  const { getAlbumVisibleIndexes: visible } = album("utils/digitalAlbumPhotoContext");
  assert.deepEqual(visible([0], 0, 8), [0]);
  assert.deepEqual(visible([6, 5, 5], 6, 8), [5, 6]);
  assert.deepEqual(visible([7], 7, 8), [7]);
  assert.deepEqual(visible([5], 5, 8), [5]);
  assert.deepEqual(visible([5, 6], 1, 8), [1]);
  assert.deepEqual(visible([], -1, 0), []);
});

test("swapping photo placements preserves slot IDs, crop, captions and undo", async () => {
  const { swapAlbumPhotoSlots: swap } = album("utils/digitalAlbumPhotoContext");
  const d = make();
  const source = d.pages[1].photos[0];
  const target = d.pages[2].photos[1];
  Object.assign(source, { photoId: "photo-a", caption: "Caption A", position: { x: 0.1, y: 0.8 }, fit: "contain" });
  Object.assign(target, { photoId: "photo-b", caption: "Caption B" });
  const revisions = [];
  const session = new Session(d, 2, 1, async (document, version, revision) => {
    revisions.push(revision);
    return { document, version, revision: revision + 1 };
  });
  session.commit((doc) => swap(doc, source.id, target.id));
  await session.flush();
  const changed = session.getSnapshot().document;
  assert.deepEqual(changed.pages[1].photos[0], { ...target, id: source.id });
  assert.deepEqual(changed.pages[2].photos[1], { ...source, id: target.id });
  assert.deepEqual(changed.pages[1].content, d.pages[1].content);
  assert.equal(swap(d, source.id, "missing"), d);
  assert.equal(swap(d, source.id, source.id), d);
  session.undo();
  await session.flush();
  assert.deepEqual(session.getSnapshot().document, d);
  session.redo();
  await session.flush();
  assert.deepEqual(session.getSnapshot().document, changed);
  assert.deepEqual(revisions, [1, 2, 3]);
});

test("replacement uses the same slot and usage counts include repeated placements only", () => {
  const { getAlbumPhotoUsage: usage } = album("utils/digitalAlbumPhotoContext");
  const actions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
  let document = make();
  const before = structuredClone(document);
  const page = document.pages[2];
  const photoActions = actions({ activePageId: page.id, commit: (update) => { document = update(document); } });
  photoActions.selectPhoto(page.photos[0].id, "shared");
  photoActions.selectPhoto(page.photos[1].id, "shared");
  assert.deepEqual(usage(document.pages), { shared: 2 });
  photoActions.selectPhoto(page.photos[0].id, "replacement");
  assert.deepEqual(usage(document.pages), { replacement: 1, shared: 1 });
  assert.equal(document.pages[2].photos[0].id, page.photos[0].id);
  assert.deepEqual(document.pages[2].content, before.pages[2].content);
  assert.equal(document.pages[2].layout, before.pages[2].layout);
  assert.deepEqual(document.pages[1], before.pages[1]);
  photoActions.removePhotoFromPage(page.photos[1].id);
  assert.deepEqual(usage(document.pages), { replacement: 1 });
  const retained = layout(document.pages[2], "quote");
  assert.deepEqual(usage([retained]), {});
  assert.equal(retained.unplacedPhotos[0].photoId, "replacement");
});

test("default document has exactly twelve ordered pages, metadata-only content, fresh IDs and no demo photos", () => {
  const { getDigitalAlbumLayout } = album("config/digitalAlbumLayouts");
  const a = make();
  const b = make();
  assert.deepEqual(parse(a), a);
  assert.equal(a.theme, "classic");
  assert.equal(a.pages.length, 12);
  assert.deepEqual(a.pages.map((p) => p.layout), ["cover", "editorial", "portrait-diptych", "three-grid", "quote", "split", "full-photo", "collage", "portrait-pair-text", "mosaic", "closing", "cover"]);
  const ids = [a, b].flatMap((d) => d.pages.flatMap((p) => [p.id, ...p.photos.map((s) => s.id)]));
  assert.equal(new Set(ids).size, ids.length);
  for (const p of a.pages) {
    const definition = getDigitalAlbumLayout(p.layout);
    assert.equal(p.photos.length, definition.photoSlotCount);
    assert.deepEqual(Object.keys(p.content).sort(), [...definition.textFields].sort());
    for (const field of definition.textFields) {
      assert.ok(p.content[field]?.trim());
      if (field === "title") assert.equal(p.content[field], "Our event");
      if (field === "date") assert.equal(p.content[field], "2027-06-15");
    }
    assert.equal(p.layoutVersion, 2);
    assert.deepEqual(p.unplacedPhotos, []);
    for (const s of p.photos) assert.equal(s.photoId, null);
  }
});

test("layout changes retain overflow references, crop, fit and captions", () => {
  const page = make().pages[3];
  page.photos.forEach((s, i) => Object.assign(s, { photoId: `photo-${i}`, position: { x: 0.2, y: 0.8 }, fit: "contain", caption: `Caption ${i}` }));
  const small = layout(page, "editorial");
  assert.equal(small.photos.length, 1);
  assert.equal(small.unplacedPhotos.length, 2);
  assert.deepEqual(layout(small, "collage").photos, page.photos);
  assert.equal(usage({ theme: "classic", pages: [small] }, "photo-2").length, 1);
  const copy = duplicate(small);
  assert.notEqual(copy.id, small.id);
  assert.notEqual(copy.unplacedPhotos[0].id, small.unplacedPhotos[0].id);
  assert.equal(copy.unplacedPhotos[0].photoId, small.unplacedPhotos[0].photoId);
});

test("retained photos fill empty slots in order without losing photo settings", () => {
  const source = layout(make().pages[0], "three-grid");
  const first = { ...source.photos[1], photoId: "first", caption: "First", fit: "contain", position: { x: 0.2, y: 0.8 } };
  const second = { ...source.photos[2], photoId: "second", caption: "Second" };
  source.photos = [source.photos[0], first, second];
  const small = layout(source, "full-photo");
  assert.deepEqual(small.photos, [first]);
  assert.deepEqual(small.unplacedPhotos, [second]);
  const empty = { ...small, photos: [{ id: "empty", photoId: null }], unplacedPhotos: [first, second] };
  const restored = layout(empty, "three-grid");
  assert.deepEqual(restored.photos.slice(0, 2), [first, second]);
  assert.equal(restored.photos[2].photoId, null);
  assert.deepEqual(restored.unplacedPhotos, []);
  assert.deepEqual(empty.unplacedPhotos, [first, second]);
  assert.deepEqual(layout(source, "quote").unplacedPhotos, [first, second]);
});

test("layout retention keeps exactly the occupied overflow for every capacity and empty-slot pattern", () => {
  const { DIGITAL_ALBUM_LAYOUT_IDS: ids, getDigitalAlbumLayout } = album("config/digitalAlbumLayouts");
  for (const from of ids) {
    const source = layout(make().pages[0], from);
    for (let mask = 0; mask < 2 ** source.photos.length; mask++) {
      const page = { ...source, photos: source.photos.map((slot, index) => ({ ...slot, photoId: mask & (1 << index) ? `photo-${index}` : null })) };
      for (const to of ids) {
        const result = layout(page, to);
        const occupied = page.photos.filter((slot) => slot.photoId);
        assert.equal(result.unplacedPhotos.length, Math.max(0, occupied.length - getDigitalAlbumLayout(to).photoSlotCount));
        assert.ok(result.unplacedPhotos.every((slot) => slot.photoId));
        assert.deepEqual([...result.photos, ...result.unplacedPhotos].filter((slot) => slot.photoId).map((slot) => slot.id).sort(), occupied.map((slot) => slot.id).sort());
      }
    }
  }
});

test("retained photos survive save/reload, page lookup and layout undo/redo", async () => {
  const source = layout(make().pages[0], "three-grid");
  source.photos.forEach((slot, index) => { slot.photoId = `saved-${index}`; });
  const document = { theme: "classic", pages: [source, make().pages[1]] };
  let saved;
  const session = new Session(document, 2, 1, async (doc, version, revision) => {
    saved = parse(JSON.parse(JSON.stringify(doc)));
    return { document: saved, version, revision: revision + 1 };
  });
  const change = (target) => session.commit((doc) => ({ ...doc, pages: doc.pages.map((page) => page.id === source.id ? layout(page, target) : page) }));
  change("full-photo");
  assert.equal(await session.flush(), true);
  assert.equal(saved.pages.find((page) => page.id === source.id).unplacedPhotos.length, 2);
  change("three-grid");
  assert.deepEqual(session.getSnapshot().document.pages[0].photos, source.photos);
  session.undo();
  assert.equal(session.getSnapshot().document.pages[0].unplacedPhotos.length, 2);
  session.redo();
  assert.deepEqual(session.getSnapshot().document.pages[0].unplacedPhotos, []);
  await session.flush();
});

test("page reorder keeps document data and ignores invalid destinations", () => {
  const d = make();
  assert.equal(move(d, 0, 7).pages[7], d.pages[0]);
  assert.equal(move(d, -1, 0), d);
  assert.equal(move(d, 0, d.pages.length), d);
  assert.equal(d.pages[0].layout, "cover");
});

test("opening an album never initializes or saves; undo/redo uses revisioned save", async () => {
  const calls = [];
  const d = make();
  const session = new Session(d, 2, 4, async (document, version, revision) => {
    calls.push(revision);
    return { document, version, revision: revision + 1 };
  });
  assert.equal(session.getSnapshot().document, d);
  assert.equal(await session.flush(), true);
  assert.deepEqual(calls, []);
  session.commit((doc) => move(doc, 0, 1));
  assert.equal(await session.flush(), true);
  session.undo();
  await session.flush();
  assert.deepEqual(session.getSnapshot().document, d);
  session.redo();
  await session.flush();
  assert.deepEqual(calls, [4, 5, 6]);
});

test("edits arriving during a save are queued using the acknowledged revision", async () => {
  let release;
  const calls = [];
  const session = new Session(make(), 2, 1, async (document, version, revision) => {
    calls.push(revision);
    if (calls.length === 1) await new Promise((resolve) => { release = resolve; });
    return { document, version, revision: revision + 1 };
  });
  session.commit((d) => move(d, 0, 1));
  session.commit((d) => move(d, 1, 2));
  release();
  assert.equal(await session.flush(), true);
  assert.deepEqual(calls, [1, 2]);
  assert.equal(session.getSnapshot().document.pages[2].layout, "cover");
});

test("network errors retain edits for retry; revision conflicts block overwrite", async () => {
  let failure = true;
  const session = new Session(make(), 2, 1, async (document, version, revision) => {
    if (failure) throw new Error("offline");
    return { document, version, revision: revision + 1 };
  });
  session.commit((d) => move(d, 0, 1));
  assert.equal(await session.flush(), false);
  failure = false;
  assert.equal(await session.flush(), true);
  let calls = 0;
  const conflict = new Session(make(), 2, 1, async () => { calls++; throw new Conflict(); });
  conflict.commit((d) => move(d, 0, 1));
  assert.equal(await conflict.flush(), false);
  assert.equal(conflict.getSnapshot().conflict, true);
  assert.equal(await conflict.flush(), false);
  assert.equal(calls, 1);
});

test("undo/redo during an in-flight save persists the latest snapshot serially", async () => {
  let release;
  let persisted;
  const revisions = [];
  const initial = make();
  const session = new Session(initial, 2, 10, async (document, version, revision) => {
    revisions.push(revision);
    if (revisions.length === 1) await new Promise((resolve) => { release = resolve; });
    persisted = document;
    return { document, version, revision: revision + 1 };
  });
  session.commit((doc) => ({ ...doc, theme: "modern" }));
  session.undo();
  session.redo();
  session.undo();
  release();
  assert.equal(await session.flush(), true);
  assert.deepEqual(revisions, [10, 11]);
  assert.deepEqual(persisted, initial);
  assert.equal(session.getSnapshot().status, "saved");
  assert.equal(session.getSnapshot().canRedo, true);
});

test("no-op edits preserve redo; real edits branch history; history stops at 50", async () => {
  let calls = 0;
  const session = new Session(make(), 2, 1, async (document, version, revision) => {
    calls++;
    return { document, version, revision: revision + 1 };
  });
  session.commit((doc) => ({ ...doc, theme: "modern" }));
  await session.flush();
  session.undo();
  await session.flush();
  const before = calls;
  session.commit((doc) => structuredClone(doc));
  assert.equal(await session.flush(), true);
  assert.equal(calls, before);
  assert.equal(session.getSnapshot().canRedo, true);
  session.commit((doc) => ({ ...doc, theme: "editorial" }));
  assert.equal(session.getSnapshot().canRedo, false);
  await session.flush();
  session.clearHistory();
  for (let i = 0; i < 55; i++) {
    session.commit((doc) => ({ ...doc, pages: doc.pages.map((page, index) => index ? page : { ...page, content: { ...page.content, title: String(i) } }) }));
  }
  let undos = 0;
  while (session.getSnapshot().canUndo) { session.undo(); undos++; }
  assert.equal(undos, 50);
  assert.equal(session.getSnapshot().document.pages[0].content.title, "4");
  await session.flush();
});

test("page actions and crop each save and round-trip through undo/redo", async () => {
  const pageActions = album("editor/hooks/album-editor/useDigitalAlbumPageActions").default;
  const photoActions = album("editor/hooks/album-editor/useDigitalAlbumPhotoActions").default;
  let persisted;
  const initial = make();
  const session = new Session(initial, 2, 1, async (document, version, revision) => {
    persisted = parse(JSON.parse(JSON.stringify(document)));
    return { document: persisted, version, revision: revision + 1 };
  });
  const actions = pageActions({ getDocument: () => session.getSnapshot().document, commit: session.commit, activePageId: initial.pages[1].id, selectPage: () => {} });
  const photos = photoActions({ activePageId: initial.pages[0].id, commit: session.commit });
  const check = async (action) => {
    const before = session.getSnapshot().document;
    await action();
    const after = session.getSnapshot().document;
    assert.notDeepEqual(after, before);
    assert.equal(await session.flush(), true);
    assert.deepEqual(persisted, after);
    session.undo();
    await session.flush();
    assert.deepEqual(persisted, before);
    session.redo();
    await session.flush();
    assert.deepEqual(persisted, after);
  };
  await check(() => actions.addPage("four-grid"));
  await check(() => actions.duplicatePage(initial.pages[1].id));
  await check(() => actions.swapPages(initial.pages[1].id, initial.pages[3].id));
  await check(() => actions.deletePage(initial.pages[1].id));
  await check(() => actions.changePageLayout(initial.pages[0].id, "three-grid"));
  const slotId = session.getSnapshot().document.pages[0].photos[0].id;
  await check(() => photos.selectPhoto(slotId, "sample"));
  await check(() => photos.updateSlot(slotId, (slot) => ({ ...slot, position: { x: 0.3, y: 0.7 }, fit: "contain", caption: "Caption" })));
});

test("date display localizes valid ISO dates and preserves free text/invalid dates", () => {
  const { formatDigitalAlbumDate: format } = album("utils/formatDigitalAlbumDate");
  assert.equal(format("2027-06-15", "en"), "June 15, 2027");
  assert.match(format("2027-06-15", "hr"), /15.*lipnja.*2027/);
  assert.equal(format("2027-02-29", "en"), "2027-02-29");
  assert.equal(format("2028-02-29", "en"), "February 29, 2028");
  assert.equal(format("Summer 2027", "en"), "Summer 2027");
  assert.equal(format(undefined, "en"), undefined);
});

test("public/print text omits empty editor prompts and renders formatted dates", () => {
  const Text = album("editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText").default;
  const html = (props) => renderToStaticMarkup(React.createElement(Text, { placeholder: "Add text", ...props }));
  assert.equal(html({ value: "  " }), "");
  assert.match(html({ editable: true }), /Add text/);
  const date = html({ value: "2027-06-15", displayValue: "June 15, 2027" });
  assert.match(date, /June 15, 2027/);
  assert.doesNotMatch(date, /2027-06-15|Add text/);
});

test("PDF print URLs preserve locale and reject unsafe remote development origins", () => {
  const { getDigitalAlbumPrintUrl: url } = album("server/pdf/getDigitalAlbumPrintUrl");
  const env = { NODE_ENV: process.env.NODE_ENV, VERCEL: process.env.VERCEL };
  process.env.NODE_ENV = "development";
  delete process.env.VERCEL;
  try {
    assert.equal(url("http://localhost:3000", "album", "en").pathname, "/en/internal/digital-albums/album/render");
    assert.equal(url("http://localhost:3000", "album", "hr").pathname, "/internal/digital-albums/album/render");
    assert.throws(() => url("https://untrusted.example", "album"), /loopback/);
  } finally {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("all layouts render without public editor prompts; photoId determines crop and captions", () => {
  const Renderer = album("components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer").default;
  const { DIGITAL_ALBUM_LAYOUT_IDS: layouts } = album("config/digitalAlbumLayouts");
  const render = (page, photos = [], extra = {}) => renderToStaticMarkup(React.createElement(Renderer, { page, photos, ...extra }));
  for (const id of layouts) {
    const page = layout(make().pages[1], id);
    page.content = {};
    const html = render(page);
    assert.match(html, new RegExp(`data-composition="${id}"`));
    assert.doesNotMatch(html, /addPhoto|data-album-photo-select|data-placeholder/);
  }
  const page = make().pages[1];
  Object.assign(page.photos[0], { photoId: "wanted", position: { x: 0.2, y: 0.8 }, fit: "contain", caption: "Our caption" });
  const previous = process.env.NEXT_PUBLIC_CDN_URL;
  process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example";
  try {
    const html = render(page, [{ id: "other", imagePath: "other.jpg" }, { id: "wanted", imagePath: "wanted.jpg" }]);
    assert.match(html, /wanted.jpg/);
    assert.doesNotMatch(html, /other.jpg/);
    assert.match(html, /object-position:20% 80%/);
    assert.match(html, /object-fit:contain/);
    assert.match(html, /Our caption/);
    assert.match(render(page), /data-album-missing-photo="true"/);
    assert.doesNotMatch(render(page), /photoError|addPhoto/);
    assert.match(render(page, [], { onSelectPhotoSlot: () => {} }), /photoError/);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_CDN_URL;
    else process.env.NEXT_PUBLIC_CDN_URL = previous;
  }
});

test("album mobile panel preserves canvas interaction, closes explicitly/on desktop and cleans up its media listener", () => {
  const previousWindow = globalThis.window;
  const panelModule = "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
  const effects = [];
  const values = [];
  let cursor = 0;
  let listener;
  let removed = false;
  const media = {
    matches: true,
    addEventListener: (name, callback) => { assert.equal(name, "change"); listener = callback; },
    removeEventListener: (name, callback) => { assert.equal(name, "change"); assert.equal(callback, listener); removed = true; },
  };
  mocks.react = {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], (value) => { values[index] = value; }];
    },
    useEffect: (effect) => { effects.push(effect); },
  };
  mocks[panelModule] = { EDITOR_MOBILE_DEFAULT_SNAP_POINT: 0.23 };
  globalThis.window = { matchMedia: (query) => { assert.equal(query, "(max-width: 767px)"); return media; } };
  try {
    const usePanel = album("editor/hooks/useDigitalAlbumMobilePanel").default;
    const panel = usePanel();
    const cleanup = effects[0]();
    panel.changeMobilePanelOpen(true);
    for (const reason of ["outside-press", "focus-out"]) {
      let cancelled = false;
      panel.changeMobilePanelOpen(false, { reason, cancel: () => { cancelled = true; } });
      assert.equal(cancelled, true);
      assert.equal(values[0], true);
    }
    panel.changeMobilePanelOpen(false, { reason: "escape-key", cancel: () => assert.fail() });
    assert.equal(values[0], false);
    panel.changeMobilePanelOpen(true);
    media.matches = false;
    listener();
    assert.equal(values[0], false);
    cleanup();
    assert.equal(removed, true);
  } finally {
    delete mocks.react;
    delete mocks[panelModule];
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("shared photo index preserves lookup and rendering across all layouts without scanning the library per slot", (context) => {
  const previousCdn = process.env.NEXT_PUBLIC_CDN_URL;
  process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example";
  context.after(() => {
    if (previousCdn === undefined) delete process.env.NEXT_PUBLIC_CDN_URL;
    else process.env.NEXT_PUBLIC_CDN_URL = previousCdn;
  });
  const { indexDigitalAlbumPhotos } = album("components/album-renderer/utils/indexDigitalAlbumPhotos");
  const { DIGITAL_ALBUM_LAYOUT_IDS } = album("config/digitalAlbumLayouts");
  const Renderer = album("components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer").default;
  const photos = [
    { id: "first", imagePath: "first.webp", description: "First caption" },
    { id: "second", imagePath: "second.webp", description: "Second caption" },
    { id: "first", imagePath: "duplicate.webp", description: "Duplicate must not override" },
  ];
  const index = indexDigitalAlbumPhotos(photos);
  assert.equal(index.get("first"), photos[0]);
  assert.equal(index.get("missing"), undefined);
  const noScan = new Proxy(photos, { get(target, property) {
    if (property === "find") throw new Error("Unexpected linear scan");
    return Reflect.get(target, property);
  } });
  for (const id of DIGITAL_ALBUM_LAYOUT_IDS) {
    const page = layout(make().pages[0], id);
    page.photos.forEach((slot, position) => Object.assign(slot, {
      photoId: ["first", "second", "missing"][position % 3],
      position: { x: 0.2, y: 0.8 }, fit: "contain",
    }));
    const baseline = renderToStaticMarkup(React.createElement(Renderer, { page, photos }));
    const indexed = renderToStaticMarkup(React.createElement(Renderer, { page, photos: noScan, photosById: index }));
    assert.equal(indexed, baseline, id);
  }
});

test("each layout defines its own WebP preview path in the existing registry", () => {
  const { DIGITAL_ALBUM_LAYOUT_IDS: ids, getDigitalAlbumLayout } = album("config/digitalAlbumLayouts");
  const paths = ids.map((id) => getDigitalAlbumLayout(id).preview);
  assert.equal(new Set(paths).size, ids.length);
  for (const path of paths) assert.match(path, /^\/digital-albums\/layout-previews\/[a-z-]+\.webp$/);
});

test("layout picker initially shows all image previews and compact filters without changing the layout", () => {
  const Picker = album("editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumLayoutPicker/DigitalAlbumLayoutPicker").default;
  let changes = 0;
  const html = renderToStaticMarkup(React.createElement(Picker, { value: "editorial", onChange: () => { changes++; } }));
  assert.equal((html.match(/<img/g) ?? []).length, album("config/digitalAlbumLayouts").DIGITAL_ALBUM_LAYOUT_IDS.length);
  assert.equal((html.match(/<button/g) ?? []).length, album("config/digitalAlbumLayouts").DIGITAL_ALBUM_LAYOUT_IDS.length + 5);
  assert.doesNotMatch(html, /<select|<rect/);
  assert.equal(changes, 0);
});

test("editor text stays present before, during and after forward/backward page turns while only visible pages are interactive", () => {
  const flipbookPath = "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook";
  let renderedPages;
  mocks[flipbookPath] = { default: ({ children }) => { renderedPages = children; return null; }, __esModule: true };
  try {
    const Renderer = album("components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer").default;
    const renderPages = (props) => {
      renderToStaticMarkup(React.createElement(Renderer, props));
      return renderedPages;
    };
    for (const empty of [true, false]) {
      const document = make();
      if (empty) document.pages.forEach((page) => { page.content = {}; });
      const original = structuredClone(document);
      let writes = 0;
      const render = (visiblePageIndexes, locked = false) => renderPages({
        document, photos: [], editable: true, visiblePageIndexes,
        activePageIndex: visiblePageIndexes[0],
        onPageContentChange: locked ? undefined : () => { writes++; },
        onSelectPhotoSlot: locked ? undefined : () => { writes++; },
      });
      const text = (element) => renderToStaticMarkup(element.props.children)
        .match(/<span[^>]*data-album-text-value[^>]*>[\s\S]*?<\/span>/g) ?? [];
      const before = render([0]);
      for (const visible of [[1, 2], [3, 4], [1, 2], [0], [11], [10], [9], [10], [11]]) {
        for (const locked of [false, true]) {
          const after = render(visible, locked);
          after.forEach((element, index) => {
            assert.equal(element.key, before[index].key);
            assert.equal(element.props.children.props.showTextPlaceholders, true);
            assert.equal(element.props.children.props.showPhotoPlaceholders, true);
            const html = renderToStaticMarkup(element.props.children);
            assert.equal((html.match(/data-album-photo-placeholder/g) ?? []).length, document.pages[index].photos.length);
            assert.equal((html.match(/data-album-photo-select/g) ?? []).length,
              !locked && visible.includes(index) ? document.pages[index].photos.length : 0);
            assert.equal(Boolean(element.props.children.props.onPageContentChange), !locked && visible.includes(index));
            assert.deepEqual(text(element), text(before[index]), `stable ${document.pages[index].layout} text, empty=${empty}`);
          });
        }
      }
      const publicPages = renderPages({ document, photos: [] });
      publicPages.forEach((element) => {
        assert.equal(element.props.children.props.showTextPlaceholders, false);
        assert.equal(element.props.children.props.showPhotoPlaceholders, false);
        assert.doesNotMatch(renderToStaticMarkup(element.props.children), /data-album-photo-placeholder/);
        assert.doesNotMatch(renderToStaticMarkup(element.props.children), /data-placeholder="true"/);
      });
      assert.equal(writes, 0);
      assert.deepEqual(document, original);
    }
  } finally {
    delete mocks[flipbookPath];
  }
});

test("pending layout text prompts use existing HR/EN editor translations without mutations or public/print leakage", async () => {
  const Renderer = album("components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer").default;
  const { getDigitalAlbumLayout } = album("config/digitalAlbumLayouts");
  const originalTranslations = mocks["next-intl"].useTranslations;
  try {
    for (const locale of ["hr", "en"]) {
      const messages = JSON.parse(readFileSync(resolve(root, `src/messages/${locale}/digital-album-editor.json`), "utf8"));
      mocks["next-intl"].useTranslations = (namespace) => (key) =>
        namespace.split(".").slice(1).concat(key.split(".")).reduce((value, part) => value?.[part], messages) ?? key;
      for (const id of ["cover", "editorial", "story", "collage", "quote", "closing"]) {
        for (const content of [{}, { title: "Real title", subtitle: "Real subtitle", text: "Real text", date: "Real date" }]) {
          const document = make(); document.pages[0].content = content;
          let saves = 0;
          const session = new Session(document, 2, 1, async (doc, version, revision) => {
            saves++; return { document: doc, version, revision: revision + 1 };
          });
          const before = structuredClone(document);
          const pending = layout(document.pages[0], id);
          const render = (props) => renderToStaticMarkup(React.createElement(Renderer, { page: pending, photos: [], ...props }));
          const preview = render({ showTextPlaceholders: true });
          const active = render({ onPageContentChange: () => assert.fail("render must not edit content") });
          assert.doesNotMatch(preview, /data-editable="true"|contentEditable="true"/);
          for (const field of getDigitalAlbumLayout(id).textFields) {
            const text = pending.content[field] || messages.upgrade.fields[field];
            assert.ok(preview.includes(text), `${locale}/${id}/${field}`);
            assert.ok(active.includes(text), `${locale}/${id}/${field}`);
          }
          assert.doesNotMatch(render({}), /data-placeholder="true"/);
          assert.deepEqual(document, before);
          await session.flush(); // Discarding the pending page has no commit/save.
          assert.equal(saves, 0);
          assert.deepEqual(session.getSnapshot().document, before);
          session.commit((doc) => ({ ...doc, pages: doc.pages.map((page, index) => index === 0 ? layout(page, id) : page) }));
          await session.flush();
          const applied = session.getSnapshot().document.pages[0];
          assert.equal(applied.layout, pending.layout);
          assert.deepEqual(applied.content, pending.content);
          assert.deepEqual(applied.photos.map((slot) => slot.photoId), pending.photos.map((slot) => slot.photoId));
          assert.deepEqual(pending.content, content);
        }
      }
    }
  } finally {
    mocks["next-intl"].useTranslations = originalTranslations;
  }
});

test("all 19 layouts round-trip through metadata, parser and every retention transition", () => {
  const { DIGITAL_ALBUM_LAYOUT_IDS: ids, getDigitalAlbumLayout } = album("config/digitalAlbumLayouts");
  assert.equal(ids.length, 19);
  for (const from of ids) {
    const source = layout(make().pages[0], from);
    source.photos.forEach((slot, index) => Object.assign(slot, { photoId: `photo-${index}`, position: { x: 0.2, y: 0.8 }, fit: "contain", caption: `Caption ${index}` }));
    source.unplacedPhotos.push({ id: "extra", photoId: "extra", caption: "Retained" });
    const all = [...source.photos, ...source.unplacedPhotos];
    for (const to of ids) {
      const result = layout(source, to);
      assert.equal(result.photos.length, getDigitalAlbumLayout(to).photoSlotCount);
      const retained = [...result.photos, ...result.unplacedPhotos];
      for (const slot of all) assert.deepEqual(retained.find((candidate) => candidate.id === slot.id), slot);
      assert.deepEqual(parse({ theme: "classic", pages: [result] }).pages[0], result);
    }
  }
});

test("all themes parse and change only theme, with revisioned undo/redo", async () => {
  const { DIGITAL_ALBUM_THEME_IDS: themes, DIGITAL_ALBUM_THEMES: metadata } = album("config/digitalAlbumThemes");
  const Print = album("components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer").default;
  const Picker = album("editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumThemePicker/DigitalAlbumThemePicker").default;
  const imports = readFileSync(resolve(root, "src/features/digital-albums/components/album-renderer/themes/DigitalAlbumThemes.css"), "utf8");
  for (const theme of themes) {
    assert.ok(imports.includes(`./${theme}/DigitalAlbum`));
    assert.match(metadata[theme].preview, /\/theme-previews\/.*\.webp$/);
    const cssName = theme[0].toUpperCase() + theme.slice(1);
    assert.ok(existsSync(resolve(root, `src/features/digital-albums/components/album-renderer/themes/${theme}/DigitalAlbum${cssName}Theme.css`)));
    const document = make();
    const session = new Session(document, 2, 1, async (doc, version, revision) => ({ document: parse(doc), version, revision: revision + 1 }));
    session.commit((doc) => ({ ...doc, theme }));
    assert.equal(await session.flush(), true);
    assert.equal(session.getSnapshot().document.theme, theme);
    assert.deepEqual(session.getSnapshot().document.pages, document.pages);
    const html = renderToStaticMarkup(React.createElement(Print, { document: session.getSnapshot().document, photos: [] }));
    assert.ok(html.includes(`data-album-theme="${theme}"`));
    assert.doesNotMatch(html, /data-placeholder="true"|data-editable="true"/);
    const picker = renderToStaticMarkup(React.createElement(Picker, { value: theme, onChange: () => assert.fail("render changed theme") }));
    assert.ok(picker.includes(metadata[theme].preview));
    assert.equal((picker.match(/aria-pressed="true"/g) ?? []).length, 1);
    session.undo(); await session.flush();
    assert.deepEqual(session.getSnapshot().document, document);
    session.redo(); await session.flush();
    assert.equal(session.getSnapshot().document.theme, theme);
  }
  assert.throws(() => parse({ theme: "unknown", pages: [] }));
});

test("all compositions render empty, short and long content with photo framing across all themes", (t) => {
  const previous = process.env.NEXT_PUBLIC_CDN_URL;
  process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example";
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_CDN_URL;
    else process.env.NEXT_PUBLIC_CDN_URL = previous;
  });
  const Page = album("components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer").default;
  const Print = album("components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer").default;
  const { DIGITAL_ALBUM_LAYOUT_IDS: ids, getDigitalAlbumLayout } = album("config/digitalAlbumLayouts");
  const { DIGITAL_ALBUM_THEME_IDS: themes } = album("config/digitalAlbumThemes");
  for (const theme of themes) for (const id of ids) for (const long of [false, true]) {
    const page = layout(make().pages[0], id);
    page.content = {};
    const empty = renderToStaticMarkup(React.createElement(Page, { page, photos: [], showTextPlaceholders: true }));
    if (getDigitalAlbumLayout(id).textFields.length) assert.match(empty, /data-placeholder="true"/);
    page.content = { title: long ? "A long title ".repeat(20) : "Title", text: long ? "Long body paragraph. ".repeat(80) : "Body", subtitle: "Subtitle", date: "2027-06-15" };
    const photos = page.photos.map((slot, index) => {
      slot.photoId = `asset-${index}`;
      slot.position = { x: 0.15, y: 0.85 };
      slot.fit = index % 2 ? "cover" : "contain";
      slot.caption = index % 2 ? "" : "Caption";
      return { id: slot.photoId, imagePath: `photo-${index}.webp` };
    });
    const html = renderToStaticMarkup(React.createElement(Print, { document: { theme, pages: [page] }, photos }));
    assert.ok(html.includes(`data-composition="${id}"`));
    assert.doesNotMatch(html, /data-placeholder="true"|data-editable="true"/);
    for (const field of getDigitalAlbumLayout(id).textFields.filter((field) => field !== "date")) assert.ok(html.includes(page.content[field].trim()), `${id}/${field}`);
    if (photos.length) assert.match(html, /object-position:15% 85%/);
  }
});

test("overflow guard rejects vertically scrolling captions and bounded text areas", () => {
  const { getDigitalAlbumTextOverflow: overflow } = album("utils/getDigitalAlbumTextOverflow");
  const previous = globalThis.getComputedStyle;
  const page = { dataset: { albumPage: "page" }, getBoundingClientRect: () => ({ left: 0, top: 0, right: 440, bottom: 640, width: 440, height: 640 }), hasAttribute: () => false };
  const text = {
    textContent: "Long caption", clientWidth: 100, scrollWidth: 100, clientHeight: 40, scrollHeight: 90,
    querySelector: () => null, closest: () => page, parentElement: page,
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40 }), hasAttribute: () => false,
  };
  globalThis.getComputedStyle = (element) => ({ overflow: element === text ? "auto" : "hidden" });
  try {
    const root = { querySelectorAll: () => [text] };
    assert.deepEqual(overflow(root), ["page"]);
    text.scrollHeight = 40;
    assert.deepEqual(overflow(root), []);
    text.querySelector = () => ({ clientWidth: 100, scrollWidth: 100, clientHeight: 0, scrollHeight: 0,
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 90, width: 100, height: 90 }) });
    assert.deepEqual(overflow(root), ["page"]);
    globalThis.getComputedStyle = () => ({ overflow: "visible" });
    text.hasAttribute = (name) => name === "data-album-text-area";
    assert.deepEqual(overflow(root), ["page"]);
  } finally {
    if (previous === undefined) delete globalThis.getComputedStyle;
    else globalThis.getComputedStyle = previous;
  }
});

test("natural font ink overhang is not page overflow, while bounded captions and out-of-page text still fail", () => {
  const { getDigitalAlbumTextOverflow: overflow } = album("utils/getDigitalAlbumTextOverflow");
  const previous = globalThis.getComputedStyle;
  const page = { dataset: { albumPage: "page" }, getBoundingClientRect: () => ({ left: 0, top: 0, right: 440, bottom: 640 }), hasAttribute: () => false };
  let top = 100;
  const text = {
    textContent: "Naslov", clientWidth: 200, scrollWidth: 200, clientHeight: 44, scrollHeight: 48,
    querySelector: () => null, closest: () => page, parentElement: page,
    getBoundingClientRect: () => ({ left: 20, top, right: 220, bottom: top + 44, width: 200, height: 44 }),
    hasAttribute: (name) => name === "data-album-text-area",
  };
  let maxHeight = "none";
  globalThis.getComputedStyle = (element) => ({ overflow: element === page ? "hidden" : "visible", maxHeight });
  try {
    const root = { querySelectorAll: () => [text] };
    assert.deepEqual(overflow(root), [], "Playfair's 48px ink in a 44px natural line fits inside the page");
    maxHeight = "105.6px";
    assert.deepEqual(overflow(root), [], "a short caption does not fill its maximum height");
    text.scrollHeight = 160;
    assert.deepEqual(overflow(root), ["page"], "a caption beyond its reserved area is rejected without clipping");
    maxHeight = "none";
    text.scrollHeight = 48;
    top = 620;
    assert.deepEqual(overflow(root), ["page"], "natural text extending outside the page is still rejected");
  } finally {
    if (previous === undefined) delete globalThis.getComputedStyle;
    else globalThis.getComputedStyle = previous;
  }
});

test("PDF readiness rejects unresolved photo references before rendering", async () => {
  const { waitForDigitalAlbumPrintReady: ready } = album("server/pdf/waitForDigitalAlbumPrintReady");
  const previous = globalThis.document;
  globalThis.document = { querySelector: () => ({ children: [{}], querySelector: () => ({}) }) };
  try {
    await assert.rejects(ready({ waitForSelector: async () => {}, evaluate: async (fn) => fn() }), /photo reference/);
  } finally {
    if (previous === undefined) delete globalThis.document; else globalThis.document = previous;
  }
});



test("public viewer navigation reuses guarded flip commands and reports stable visible pages", async () => {
  const soundPath = "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/useDigitalAlbumFlipSound";
  mocks[soundPath] = { default: () => ({ handleFlipSoundFrame() {} }), __esModule: true };
  mocks.react = { ...React, useRef: (current) => ({ current }), useState: (value) => [value, () => {}], useEffect() {} };
  let hook;
  try { hook = album("components/album-renderer/DigitalAlbumFlipBook/useDigitalAlbumFlipBook").default; }
  finally { delete mocks.react; delete mocks[soundPath]; }
  const visible = [];
  const controls = hook({ children: ["a", "b", "c", "d"], width: 440, height: 640,
    onVisiblePagesChange: (pages) => visible.push(pages) });
  // Pressing controls before initialization must not leave navigation locked.
  controls.handleNext();
  const calls = [];
  controls.bookRef.current = { page: 0, rect: { pageWidth: 440 },
    flipTo: async (page) => { calls.push(["to", page]); return true; },
    flipNext: async () => { calls.push(["next"]); return true; },
    flipPrev: async () => { calls.push(["previous"]); return true; } };
  controls.handleGoTo(-1);
  controls.handleGoTo(4);
  controls.handleGoTo(1.5);
  assert.deepEqual(calls, []);
  controls.handleGoTo(2);
  controls.handleNext();
  controls.handlePrevious();
  assert.deepEqual(calls, [["to", 2]]);
  const frame = { flip: null, left: 1, right: 2, rect: { pageWidth: 440 } };
  controls.handleFrame({ frame });
  controls.handleFrame({ frame });
  assert.deepEqual(visible, [[1, 2]]);
  controls.handleNext();
  assert.deepEqual(calls.at(-1), ["next"]);
  controls.handleFrame({ frame: { ...frame, left: 3, right: null } });
  assert.deepEqual(visible.at(-1), [3]);
  controls.handlePrevious();
  assert.deepEqual(calls.at(-1), ["previous"]);
  await Promise.resolve();
});

test("reader thumbnails reuse the same public page preview without editor controls", () => {
  const Preview = album("components/album-renderer/DigitalAlbumPagePreview/DigitalAlbumPagePreview").default;
  const document = make();
  for (const page of document.pages) {
    const editorLibraryInput = renderToStaticMarkup(React.createElement(Preview, { page, theme: document.theme, photos: [] }));
    const publicInput = renderToStaticMarkup(React.createElement(Preview, { page, theme: document.theme, rendererPhotos: [], photosById: new Map() }));
    assert.equal(publicInput, editorLibraryInput);
    assert.doesNotMatch(publicInput, /contenteditable|data-album-photo-select|data-album-photo-placeholder/);
  }
});


test("public demos use real documents for every theme with local photos and no starter contamination", () => {
  const { createDemoDigitalAlbumDocument: demo } = album("demo/createDemoDigitalAlbumDocument");
  const { digitalAlbumDemoPhotos: photos } = album("demo/digitalAlbumDemoPhotos");
  const { DIGITAL_ALBUM_THEME_IDS: themes } = album("config/digitalAlbumThemes");
  const { getDigitalAlbumLayout: definition } = album("config/digitalAlbumLayouts");
  const { getDigitalAlbumPhotoUrl: url } = album("components/album-renderer/utils/getDigitalAlbumPhotoUrl");
  const before = process.env.NEXT_PUBLIC_CDN_URL;
  delete process.env.NEXT_PUBLIC_CDN_URL;
  try {
    for (const photo of photos) {
      assert.equal(url(photo), photo.imagePath);
      const asset = readFileSync(resolve(root, "public", photo.imagePath.slice(1)));
      assert.equal(asset.toString("ascii", 0, 4), "RIFF");
      assert.equal(asset.toString("ascii", 8, 12), "WEBP");
    }
    for (const theme of themes) {
      const doc = demo(theme);
      assert.equal(doc.theme, theme);
      assert.equal(doc.pages.length, 20);
      assert.equal(doc.pages.length % 2, 0);
      const { DIGITAL_ALBUM_LAYOUT_IDS: layouts } = album("config/digitalAlbumLayouts");
      assert.deepEqual([...new Set(doc.pages.map(p => p.layout))].sort(), [...layouts].sort());
      assert.equal(doc.pages[0].layout, "cover");
      assert.equal(doc.pages.at(-1).layout, "cover");
      assert.deepEqual(parse(doc), doc);
      assert.equal(new Set(doc.pages.map(p => p.id)).size, 20);
      const ids = doc.pages.flatMap(p => p.photos.map(s => s.id));
      assert.equal(new Set(ids).size, ids.length);
      for (const page of doc.pages) {
        assert.equal(page.photos.length, definition(page.layout).photoSlotCount);
        assert.deepEqual(Object.keys(page.content), [...definition(page.layout).textFields]);
        assert.ok(page.photos.every(slot => photos.some(photo => photo.id === slot.photoId)));
      }
      const Page = album("components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer").default;
      for (const page of doc.pages) {
        const html = renderToStaticMarkup(React.createElement(Page, { page, photos }));
        assert.doesNotMatch(html, /data-album-photo-placeholder|contenteditable|https?:/);
        if (page.photos.length) assert.match(html, /\/digital-albums\/demo\//);
      }
      assert.deepEqual(doc.pages, demo(themes[0]).pages);
      doc.pages[0].photos[0].photoId = null;
      assert.notEqual(demo(theme).pages[0].photos[0].photoId, null);
    }
    assert.ok(make().pages.every(p => p.photos.every(s => s.photoId === null)));
  } finally {
    if (before === undefined) delete process.env.NEXT_PUBLIC_CDN_URL;
    else process.env.NEXT_PUBLIC_CDN_URL = before;
  }
});


test("flip sound unlocks on gestures, plays once per turn, resumes after suspension and cleans up", async () => {
  const previous = { AudioContext: globalThis.AudioContext, document: globalThis.document, fetch: globalThis.fetch };
  const effects = [], listeners = new Map();
  let audio, plays = 0, stops = 0;
  globalThis.document = { hidden: false, addEventListener: (name, cb) => listeners.set(name, cb), removeEventListener: (name) => listeners.delete(name) };
  globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) });
  globalThis.AudioContext = class {
    state = "suspended";
    constructor() { audio = this; }
    resume() { this.state = "running"; return Promise.resolve(); }
    close() { this.state = "closed"; return Promise.resolve(); }
    decodeAudioData() { return Promise.resolve({}); }
    createGain() { return { gain: {}, connect() {}, disconnect() {} }; }
    createBufferSource() { return { connect: (gain) => gain, disconnect() {}, start() { plays++; }, stop() { stops++; } }; }
  };
  mocks.react = { ...React, useRef: current => ({ current }), useEffect: fn => effects.push(fn) };
  let cleanup = [];
  try {
    const hook = album("components/album-renderer/DigitalAlbumFlipBook/useDigitalAlbumFlipSound").default;
    const sound = hook();
    cleanup = effects.map(fn => fn());
    await new Promise(resolve => setImmediate(resolve));
    listeners.get("pointerdown")();
    sound.handleFlipSoundFrame({ flip: {} });
    sound.handleFlipSoundFrame({ flip: {} });
    assert.equal(plays, 1);
    document.hidden = true;
    listeners.get("visibilitychange")();
    assert.equal(stops, 1);
    document.hidden = false;
    audio.state = "suspended";
    listeners.get("keydown")();
    sound.handleFlipSoundFrame({ flip: {} });
    assert.equal(plays, 2);
  } finally {
    cleanup.forEach(fn => fn?.());
    delete mocks.react;
    Object.assign(globalThis, previous);
  }
  assert.equal(audio.state, "closed");
  assert.equal(listeners.size, 0);
});
