import {
  getInvitationLayout,
} from "../config/invitationLayouts";
import { getInvitationPageDesigns } from "../config/invitationPageDesigns";
import type { InvitationTheme } from "../config/invitationThemes";

import type {
  InvitationLayout,
} from "../config/invitationLayouts";

import {
  getInvitationPageType,
} from "../config/invitationPageTypes";

import type {
  InvitationPageType,
} from "../config/invitationPageTypes";

import type {
  InvitationDocument,
  InvitationDocumentPage,
} from "../types/invitationDocument.types";


/* ==========================================================================
   Invitation Documents Equal
========================================================================== */

export function invitationDocumentsEqual(
  a: InvitationDocument,
  b: InvitationDocument
): boolean {
  // JSONB and record parsing may reorder object keys. Their order is not
  // document content; array order (pages, slots) still is significant.
  const orderedObject = (_key: string, value: unknown): unknown => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }

    return Object.fromEntries(
      Object.entries(value).sort(([left], [right]) => (
        left < right ? -1 : left > right ? 1 : 0
      )),
    );
  };

  return JSON.stringify(a, orderedObject) === JSON.stringify(b, orderedObject);
}


/* ==========================================================================
   Create Invitation Page
========================================================================== */

export function createInvitationPage(
  type: InvitationPageType
): InvitationDocumentPage {
  const layout =
    getInvitationPageType(
      type
    ).layouts[0];

  const photoSlotCount =
    getInvitationLayout(
      layout
    ).photoSlotCount;

  return {
    id:
      crypto.randomUUID(),

    type,

    layout,

    layoutVersion:
      1,

    content:
      {},

    photos:
      Array.from(
        {
          length:
            photoSlotCount,
        },
        () => ({
          id:
            crypto.randomUUID(),

          photoId:
            null,
        })
      ),

    variant: "default",
  };
}


/* ==========================================================================
   Change Invitation Page Layout
========================================================================== */

export function changeInvitationPageLayout(
  page: InvitationDocumentPage,
  layout: InvitationLayout,
  type = page.type
): InvitationDocumentPage {
  const pageType =
    getInvitationPageType(
      type
    );

  if (
    !pageType.layouts.includes(
      layout
    )
  ) {
    return page;
  }

  if (
    page.type === type
    && page.layout === layout
  ) {
    return page;
  }

  const photoSlotCount =
    getInvitationLayout(
      layout
    ).photoSlotCount;

  const retainedPhotos = [
    ...page.photos.slice(
      photoSlotCount
    ),
    ...(page.unplacedPhotos ?? []),
  ].filter(
    (slot) =>
      slot.photoId
  );

  const photos =
    Array.from(
      {
        length:
          photoSlotCount,
      },
      (_, index) => {
        const currentSlot =
          page.photos[index];

        if (
          currentSlot?.photoId
        ) {
          return currentSlot;
        }

        return (
          retainedPhotos.shift()
          ?? currentSlot
          ?? {
            id:
              crypto.randomUUID(),

            photoId:
              null,
          }
        );
      }
    );

  return {
    ...page,
    type,
    layout,
    photos,
    unplacedPhotos:
      retainedPhotos,
    variant: "default",
  };
}


/* ==========================================================================
   Change Invitation Page Design
========================================================================== */

export function changeInvitationPageDesign(
  page: InvitationDocumentPage,
  designId: string,
  theme: InvitationTheme,
): InvitationDocumentPage {
  const design = getInvitationPageDesigns(page.type, theme)
    .find(option => option.id === designId);
  if (!design) return page;
  if (page.layout === design.layout && page.variant === design.variant) return page;

  return {
    ...changeInvitationPageLayout(page, design.layout),
    variant: design.variant,
  };
}

/* ==========================================================================
   Move Invitation Page
========================================================================== */

export function moveInvitationPage(
  document: InvitationDocument,
  sourceId: string,
  targetId: string
): InvitationDocument {
  const sourceIndex =
    document.pages.findIndex(
      (page) =>
        page.id === sourceId
    );

  const targetIndex =
    document.pages.findIndex(
      (page) =>
        page.id === targetId
    );

  if (
    sourceIndex < 0
    || targetIndex < 0
    || sourceIndex === targetIndex
  ) {
    return document;
  }

  const pages = [
    ...document.pages,
  ];

  const [
    page,
  ] =
    pages.splice(
      sourceIndex,
      1
    );

  pages.splice(
    targetIndex,
    0,
    page
  );

  return {
    ...document,
    pages,
  };
}


/* ==========================================================================
   Invitation Photo IDs
========================================================================== */

export function invitationPhotoIds(
  document: InvitationDocument
): string[] {
  return [
    ...new Set(
      document.pages.flatMap(
        (page) =>
          [
            ...page.photos,
            ...(page.unplacedPhotos ?? []),
          ].flatMap(
            (slot) =>
              slot.photoId
                ? [slot.photoId]
                : []
          )
      )
    ),
  ];
}


/* ==========================================================================
   Remove Invitation Photo References
========================================================================== */

export function removeInvitationPhotoReferences(
  document: InvitationDocument,
  photoId: string
): InvitationDocument {
  return {
    ...document,

    pages:
      document.pages.map(
        (page) => ({
          ...page,

          photos:
            page.photos.map(
              (slot) =>
                slot.photoId === photoId
                  ? {
                      id: slot.id,
                      photoId: null,
                    }
                  : slot
            ),

          unplacedPhotos:
            page.unplacedPhotos?.filter(
              (slot) =>
                slot.photoId !== photoId
            ),
        })
      ),
  };
}


/* ==========================================================================
   Duplicate Invitation Page
========================================================================== */

export function duplicateInvitationPage(
  document: InvitationDocument,
  pageId: string
): InvitationDocument {
  const pageIndex =
    document.pages.findIndex(
      (page) =>
        page.id === pageId
    );

  if (
    pageIndex < 0
    || document.pages.length >= 100
  ) {
    return document;
  }

  const source =
    document.pages[
      pageIndex
    ];

  const duplicate: InvitationDocumentPage = {
    ...source,

    id:
      crypto.randomUUID(),

    content: {
      ...source.content,
    },

    photos:
      source.photos.map(
        (slot) => ({
          ...slot,
          id:
            crypto.randomUUID(),
        })
      ),

    ...(source.unplacedPhotos
      ? {
          unplacedPhotos:
            source.unplacedPhotos.map(
              (slot) => ({
                ...slot,
                id:
                  crypto.randomUUID(),
              })
            ),
        }
      : {}),
  };

  const pages = [
    ...document.pages,
  ];

  pages.splice(
    pageIndex + 1,
    0,
    duplicate
  );

  return {
    ...document,
    pages,
  };
}
