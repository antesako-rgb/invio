import "./digital-album-test-loader.mjs";
import assert from "node:assert/strict";
const { DigitalAlbumSession } = await import(
  "../src/features/digital-albums/editor/state/DigitalAlbumSession.ts"
);
const initial = {
  theme: "classic",
  pages: [
    { id: "p", layout: "story", photos: [], content: { title: "original" } },
  ],
};
const title = (value) => (document) => ({
  ...document,
  pages: document.pages.map((p) => ({
    ...p,
    content: { ...p.content, title: value },
  })),
});
const releases = [];
const calls = [];
let concurrent = 0,
  max = 0;
const session = new DigitalAlbumSession(
  initial,
  7,
  1,
  async (document, version, revision) => {
    calls.push({ document, version, revision });
    concurrent++;
    max = Math.max(max, concurrent);
    await new Promise((resolve) => releases.push(resolve));
    concurrent--;
    return { document, version, revision: revision + 1 };
  },
);
session.commit(title("one"));
session.commit(title("two"));
session.commit(title("three"));
assert.equal(calls.length, 1);
assert.equal(session.getSnapshot().status, "saving");
releases.shift()();
await new Promise((r) => setTimeout(r, 0));
assert.equal(calls.length, 2);
assert.equal(calls[1].document.pages[0].content.title, "three");
assert.equal(calls[1].version, 7);
assert.equal(calls[1].revision, 2);
releases.shift()();
assert.equal(await session.flush(), true);
assert.equal(max, 1);
assert.equal(session.getSnapshot().status, "saved");
session.undo();
assert.equal(session.getSnapshot().document.pages[0].content.title, "two");
releases.shift()();
await session.flush();
let fail = true;
const failed = new DigitalAlbumSession(
  initial,
  1,
  1,
  async (document, version, revision) => {
    if (fail) throw Error("offline");
    return { document, version, revision: revision + 1 };
  },
);
failed.commit(title("local"));
assert.equal(await failed.flush(), false);
failed.commit(title("latest"));
assert.equal(failed.getSnapshot().status, "error");
assert.equal(failed.getSnapshot().document.pages[0].content.title, "latest");
fail = false;
assert.equal(await failed.flush(), true);
assert.equal(failed.getSnapshot().status, "saved");
const stripped = new DigitalAlbumSession(initial, 1, 1, async () => ({
  document: initial,
  version: 1,
  revision: 2,
}));
stripped.commit(title("must survive"));
assert.equal(await stripped.flush(), false);
assert.equal(
  stripped.getSnapshot().document.pages[0].content.title,
  "must survive",
);
failed.clearHistory();
assert.equal(failed.getSnapshot().canUndo, false);
console.log(
  "PASS: serialized/coalesced saves; rapid edits; opaque returned version; failure/retry; local recovery; undo; round-trip mismatch; history barrier.",
);

const { DigitalAlbumSaveConflict, assertDigitalAlbumRevision } = await import(
  "../src/features/digital-albums/utils/digitalAlbumRevision.ts"
);
let writes = 0;
const conflict = new DigitalAlbumSession(initial, 1, 1, async () => {
  writes++;
  throw new DigitalAlbumSaveConflict();
});
conflict.commit(title("retain local"));
assert.equal(await conflict.flush(), false);
assert.equal(conflict.getSnapshot().conflict, true);
assert.equal(
  conflict.getSnapshot().document.pages[0].content.title,
  "retain local",
);
conflict.commit(title("more local"));
assert.equal(await conflict.flush(), false);
assert.equal(writes, 1);
for (const revision of [
  undefined,
  null,
  0,
  -1,
  1.5,
  Number.MAX_SAFE_INTEGER + 1,
  "1",
])
  assert.throws(() => assertDigitalAlbumRevision(revision));
console.log(
  "PASS: separate format/revision; conflict retains edits and prevents blind retry; unsafe revisions rejected.",
);

// A listener can enqueue a new edit while the previous save announces completion.
const reentrantCalls = [];
const reentrant = new DigitalAlbumSession(
  initial,
  1,
  1,
  async (document, version, revision) => {
    reentrantCalls.push(revision);
    return { document, version, revision: revision + 1 };
  },
);
let appended = false;
reentrant.subscribe(() => {
  if (reentrant.getSnapshot().status === "saved" && !appended) {
    appended = true;
    reentrant.commit(title("completion edit"));
  }
});
reentrant.commit(title("first edit"));
assert.equal(await reentrant.flush(), true);
assert.deepEqual(reentrantCalls, [1, 2]);
assert.equal(reentrant.getSnapshot().status, "saved");
// A response can be lost after DB commit. Retry must use the old expected revision.
let storedRevision = 1;
const expected = [];
const uncertain = new DigitalAlbumSession(
  initial,
  1,
  1,
  async (_document, _version, revision) => {
    expected.push(revision);
    if (revision !== storedRevision) throw new DigitalAlbumSaveConflict();
    storedRevision++;
    throw new Error("response lost after commit");
  },
);
uncertain.commit(title("committed remotely"));
assert.equal(await uncertain.flush(), false);
assert.equal(await uncertain.flush(), false);
assert.deepEqual(expected, [1, 1]);
assert.equal(uncertain.getSnapshot().conflict, true);
assert.equal(
  uncertain.getSnapshot().document.pages[0].content.title,
  "committed remotely",
);
console.log(
  "PASS: completion-time edit drained; lost-response retry preserves expected revision and local changes.",
);

const redoSession = new DigitalAlbumSession(
  initial,
  1,
  1,
  async (document, version, revision) => ({
    document,
    version,
    revision: revision + 1,
  }),
);
redoSession.commit(title("A"));
redoSession.commit(title("B"));
redoSession.undo();
assert.equal(redoSession.getSnapshot().canRedo, true);
assert.equal(redoSession.getSnapshot().document.pages[0].content.title, "A");
redoSession.redo();
assert.equal(redoSession.getSnapshot().document.pages[0].content.title, "B");
assert.equal(redoSession.getSnapshot().canRedo, false);
redoSession.undo();
redoSession.commit(title("C"));
assert.equal(redoSession.getSnapshot().canRedo, false);
redoSession.redo();
assert.equal(redoSession.getSnapshot().document.pages[0].content.title, "C");
redoSession.undo();
redoSession.clearHistory();
assert.equal(redoSession.getSnapshot().canUndo, false);
assert.equal(redoSession.getSnapshot().canRedo, false);
const cleared = redoSession.getSnapshot().document;
redoSession.undo();
redoSession.redo();
assert.deepEqual(redoSession.getSnapshot().document, cleared);
assert.equal(await redoSession.flush(), true);
console.log(
  "PASS: undo/redo, edit clears redo, deletion history barrier clears both stacks, shared save queue.",
);

const { default: photoActions } = await import(
  "../src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPhotoActions.ts"
);
let photoDocument = {
  theme: "classic",
  pages: [
    {
      id: "page",
      layout: "full-photo",
      photos: [
        {
          id: "slot",
          photoId: "original",
          position: { x: 0.2, y: 0.8 },
          fit: "contain",
          caption: "Original caption",
        },
      ],
      content: {},
    },
  ],
};
const actions = photoActions({
  activePageId: "page",
  commit: (update) => {
    photoDocument = update(photoDocument);
  },
});
const originalSlot = photoDocument.pages[0].photos[0];
actions.selectPhoto("slot", "original");
assert.deepEqual(photoDocument.pages[0].photos[0], originalSlot);
actions.selectPhoto("slot", "replacement");
assert.deepEqual(photoDocument.pages[0].photos[0], {
  id: "slot",
  photoId: "replacement",
});
actions.removePhotoFromPage("slot");
assert.deepEqual(photoDocument.pages[0].photos[0], {
  id: "slot",
  photoId: null,
});
console.log(
  "PASS: same photo preserves metadata; replacement/removal clears image-specific framing and caption.",
);
