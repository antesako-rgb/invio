import {
  getDigitalAlbumLayout,
} from "../config/digitalAlbumLayouts";

import type {
  DigitalAlbumDocument,
  DigitalAlbumDocumentPage,
  DigitalAlbumPageLayout,
} from "../types/digitalAlbumDocument.types";


/* ==========================================================================
   Change Digital Album Page Layout
========================================================================== */

export function changeDigitalAlbumPageLayout(
  page:
    DigitalAlbumDocumentPage,

  layout:
    DigitalAlbumPageLayout
): DigitalAlbumDocumentPage {
  const count =
    getDigitalAlbumLayout(
      layout
    ).photoSlotCount;

  // Keep occupied visible positions, then restore overflow in its saved order.
  // Empty slots are not retained photographs and must not block restoration.
  const retained = [
    ...page.photos.slice(count),
    ...(page.unplacedPhotos ?? []),
  ].filter((slot) => slot.photoId);
  let restored = 0;
  const photos = Array.from({ length: count }, (_, index) => {
    const existing = page.photos[index];
    if (existing?.photoId) return existing;
    return retained[restored++] ?? existing ?? {
      id: crypto.randomUUID(),
      photoId: null,
    };
  });

  const content = {
    ...page.content,
  };


  /* ==========================================================================
     Legacy Content Migration
  ========================================================================== */

  if (
    (page.layoutVersion ?? 1) === 1
  ) {
    if (
      page.layout === "cover" &&
      content.date === undefined
    ) {
      content.date =
        content.text;
    }

    if (
      page.layout === "collage" &&
      content.subtitle === undefined
    ) {
      content.subtitle =
        content.text;
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    ...page,

    layout,

    layoutVersion:
      2,

    content,

    photos,

    unplacedPhotos: retained.slice(restored),
  };
}


/* ==========================================================================
   Duplicate Digital Album Page
========================================================================== */

export function duplicateDigitalAlbumPage(
  page:
    DigitalAlbumDocumentPage
): DigitalAlbumDocumentPage {
  const copy =
    structuredClone(
      page
    );

  copy.id =
    crypto.randomUUID();

  for (
    const slot of [
      ...copy.photos,
      ...(copy.unplacedPhotos ?? []),
    ]
  ) {
    slot.id =
      crypto.randomUUID();
  }

  return copy;
}


/* ==========================================================================
   Move Digital Album Page
========================================================================== */

export function moveDigitalAlbumPage(
  document:
    DigitalAlbumDocument,

  from:
    number,

  to:
    number
): DigitalAlbumDocument {
  if (
    from < 0 ||
    to < 0 ||
    from >= document.pages.length ||
    to >= document.pages.length ||
    from === to
  ) {
    return document;
  }

  const pages = [
    ...document.pages,
  ];

  pages.splice(
    to,
    0,
    ...pages.splice(
      from,
      1
    )
  );

  return {
    ...document,
    pages,
  };
}


/* ==========================================================================
   Album Photo Usage
========================================================================== */

export function albumPhotoUsage(
  document:
    DigitalAlbumDocument,

  photoId:
    string
) {
  return document.pages.filter(
    (page) =>
      [
        ...page.photos,
        ...(page.unplacedPhotos ?? []),
      ].some(
        (slot) =>
          slot.photoId === photoId
      )
  );
}


/* ==========================================================================
   Album Documents Equal
========================================================================== */

export function albumDocumentsEqual(
  a:
    unknown,

  b:
    unknown
): boolean {
  const canonical = (
    value:
      unknown
  ): unknown => {
    if (
      Array.isArray(
        value
      )
    ) {
      return value.map(
        canonical
      );
    }

    if (
      value &&
      typeof value === "object"
    ) {
      return Object.fromEntries(
        Object
          .entries(
            value
          )
          .filter(
            (
              [
                ,
                entry,
              ]
            ) =>
              entry !== undefined
          )
          .sort(
            (
              [a],
              [b]
            ) =>
              a.localeCompare(
                b
              )
          )
          .map(
            (
              [
                key,
                entry,
              ]
            ) => [
              key,
              canonical(
                entry
              ),
            ]
          )
      );
    }

    return value;
  };

  return (
    JSON.stringify(
      canonical(
        a
      )
    ) ===
    JSON.stringify(
      canonical(
        b
      )
    )
  );
}