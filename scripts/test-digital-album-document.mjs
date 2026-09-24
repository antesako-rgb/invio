import "./digital-album-test-loader.mjs";
import assert from "node:assert/strict";
const { DIGITAL_ALBUM_LAYOUTS } = await import(
  "../src/features/digital-albums/config/digitalAlbumLayouts.ts"
);
const { parseDigitalAlbumDocument } = await import(
  "../src/features/digital-albums/utils/parseDigitalAlbumDocument.ts"
);
const {
  changeDigitalAlbumPageLayout,
  duplicateDigitalAlbumPage,
  moveDigitalAlbumPage,
  albumPhotoUsage,
  removeAlbumPhotoReferences,
} = await import(
  "../src/features/digital-albums/utils/digitalAlbumDocumentOperations.ts"
);
const { digitalAlbumPhotoStyle } = await import(
  "../src/features/digital-albums/utils/digitalAlbumPhotoStyle.ts"
);
const make = (layout, premium = false) => ({
  id: layout,
  layout,
  ...(premium ? { layoutVersion: 2 } : {}),
  photos: Array.from(
    { length: DIGITAL_ALBUM_LAYOUTS[layout].photoSlotCount },
    (_, i) => ({ id: layout + i, photoId: "photo" + i }),
  ),
  content: {
    title: "\u017deljka i \u0160ime",
    text: "\u010cuvamo na\u0161e uspomene.",
  },
});
for (const definition of Object.values(DIGITAL_ALBUM_LAYOUTS)) {
  const p = make(definition.id, !definition.legacy);
  assert.deepEqual(
    parseDigitalAlbumDocument({ theme: "classic", pages: [p] }).pages[0],
    p,
  );
  const upgraded = changeDigitalAlbumPageLayout(p, p.layout);
  assert.deepEqual(
    parseDigitalAlbumDocument({ theme: "classic", pages: [upgraded] }).pages[0],
    upgraded,
  );
}
const original = make("collage");
original.photos[0].position = { x: 0.2, y: 0.8 };
original.photos[0].fit = "contain";
original.photos[0].caption = "\u010caroban dan";
let page = changeDigitalAlbumPageLayout(original, "full-photo");
assert.equal(page.unplacedPhotos.length, 2);
page = changeDigitalAlbumPageLayout(page, "story");
assert.equal(page.unplacedPhotos.length, 3);
page = parseDigitalAlbumDocument(
  JSON.parse(JSON.stringify({ theme: "classic", pages: [page] })),
).pages[0];
page = changeDigitalAlbumPageLayout(page, "collage");
assert.deepEqual(page.photos, original.photos);
assert.equal(page.content.text, original.content.text);
const duplicate = duplicateDigitalAlbumPage(page);
assert.notEqual(duplicate.id, page.id);
assert.equal(duplicate.photos[0].photoId, page.photos[0].photoId);
assert.notEqual(duplicate.photos[0].id, page.photos[0].id);
assert.deepEqual(duplicate.photos[0].position, page.photos[0].position);
const document = { theme: "classic", pages: [page, duplicate, make("story")] };
assert.deepEqual(
  moveDigitalAlbumPage(document, 0, 2).pages.map((p) => p.id),
  [duplicate.id, "story", page.id],
);
assert.equal(albumPhotoUsage(document, "photo0").length, 2);
assert.equal(
  albumPhotoUsage(removeAlbumPhotoReferences(document, "photo0"), "photo0")
    .length,
  0,
);
const parked = {
  theme: "classic",
  pages: [changeDigitalAlbumPageLayout(page, "story")],
};
assert.equal(
  albumPhotoUsage(removeAlbumPhotoReferences(parked, "photo0"), "photo0")
    .length,
  0,
);
assert.deepEqual(digitalAlbumPhotoStyle(page.photos[0]), {
  objectFit: "contain",
  objectPosition: "20% 80%",
});
assert.deepEqual(digitalAlbumPhotoStyle({ id: "empty", photoId: null }), {
  objectFit: "cover",
  objectPosition: "50% 50%",
});
for (const bad of [
  { ...page, layoutVersion: 99 },
  { ...page, photos: [] },
  { ...page, futureData: true },
  {
    ...page,
    photos: page.photos.map((p, i) =>
      i ? p : { ...p, position: { x: 2, y: 0 } },
    ),
  },
]) {
  assert.throws(() =>
    parseDigitalAlbumDocument({ theme: "classic", pages: [bad] }),
  );
}
console.log(
  "PASS: 6 legacy + 13 premium schemas; additive round-trip; 3?1?0?reload?3; position/caption; duplicates; reorder; active/parked photo references; malformed/future data rejected.",
);
