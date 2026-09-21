import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from "react";

import {
  getDigitalAlbumLayout,
} from "@/features/digital-albums/config/digitalAlbumLayouts";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageLayout,
  DigitalAlbumPhotoSlot,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumPageActionsOptions {
  document:
    DigitalAlbumDocument;

  activePageId:
    string | null;

  activePhotoSlotId:
    string | null;

  setDocument:
    Dispatch<
      SetStateAction<
        DigitalAlbumDocument
      >
    >;

  setActivePageId:
    Dispatch<
      SetStateAction<
        string | null
      >
    >;

  setActivePhotoSlotId:
    Dispatch<
      SetStateAction<
        string | null
      >
    >;

  sidebarSelectedPageIdRef:
    MutableRefObject<
      string | null
    >;

  saveDocument:
    (
      document:
        DigitalAlbumDocument
    ) => Promise<void>;
}


/* ==========================================================================
   Helpers
========================================================================== */

function createPhotoSlot():
  DigitalAlbumPhotoSlot {
  return {
    id:
      crypto.randomUUID(),

    photoId:
      null,
  };
}

function buildPhotoSlots(
  currentPhotos:
    DigitalAlbumPhotoSlot[],
  photoSlotCount:
    number
): DigitalAlbumPhotoSlot[] {
  return Array.from(
    {
      length:
        photoSlotCount,
    },
    (
      _,
      index
    ) =>
      currentPhotos[index] ??
      createPhotoSlot()
  );
}


/* ==========================================================================
   Use Digital Album Page Actions
========================================================================== */

export default function useDigitalAlbumPageActions({
  document,
  activePageId,
  activePhotoSlotId,
  setDocument,
  setActivePageId,
  setActivePhotoSlotId,
  sidebarSelectedPageIdRef,
  saveDocument,
}: UseDigitalAlbumPageActionsOptions) {
/* ==========================================================================
   Add Page
========================================================================== */

async function addPage(
  layout:
    DigitalAlbumPageLayout
) {
  const pageId =
    crypto.randomUUID();

  const layoutDefinition =
    getDigitalAlbumLayout(
      layout
    );

  const photoSlots =
    buildPhotoSlots(
      [],
      layoutDefinition.photoSlotCount
    );

  const nextDocument:
    DigitalAlbumDocument = {
      ...document,

      pages: [
        ...document.pages,

        {
          id:
            pageId,

          layout,

          photos:
            photoSlots,

          content: {},
        },
      ],
    };

  setDocument(
    nextDocument
  );

  sidebarSelectedPageIdRef.current =
    pageId;

  setActivePageId(
    pageId
  );

  setActivePhotoSlotId(
    photoSlots[0]?.id ??
    null
  );

  await saveDocument(
    nextDocument
  );

  return pageId;
}

  /* ==========================================================================
     Change Page Layout
  ========================================================================== */

  async function changePageLayout(
    pageId:
      string,
    layout:
      DigitalAlbumPageLayout
  ) {
    const pageIndex =
      document.pages.findIndex(
        (page) =>
          page.id ===
          pageId
      );

    if (
      pageIndex < 0
    ) {
      return;
    }

    const page =
      document.pages[
        pageIndex
      ];

    if (
      !page ||
      page.layout ===
        layout
    ) {
      return;
    }

    const layoutDefinition =
      getDigitalAlbumLayout(
        layout
      );

    const nextPhotos =
      buildPhotoSlots(
        page.photos,
        layoutDefinition.photoSlotCount
      );

    const nextPages = [
      ...document.pages,
    ];

    nextPages[
      pageIndex
    ] = {
      ...page,

      layout,

      photos:
        nextPhotos,
    };

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          nextPages,
      };

    setDocument(
      nextDocument
    );

    if (
      activePageId ===
        pageId
    ) {
      const activeSlotStillExists =
        nextPhotos.some(
          (photoSlot) =>
            photoSlot.id ===
            activePhotoSlotId
        );

      if (
        !activeSlotStillExists
      ) {
        setActivePhotoSlotId(
          nextPhotos[0]?.id ??
          null
        );
      }
    }

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Duplicate Page
  ========================================================================== */

  async function duplicatePage(
    pageId:
      string
  ) {
    const pageIndex =
      document.pages.findIndex(
        (page) =>
          page.id ===
          pageId
      );

    if (
      pageIndex < 0
    ) {
      return;
    }

    const sourcePage =
      document.pages[
        pageIndex
      ];

    if (
      !sourcePage
    ) {
      return;
    }

    const duplicatedPageId =
      crypto.randomUUID();

    const duplicatedPhotos =
      sourcePage.photos.map(
        (photo) => ({
          ...photo,

          id:
            crypto.randomUUID(),
        })
      );

    const duplicatedPage = {
      ...sourcePage,

      id:
        duplicatedPageId,

      photos:
        duplicatedPhotos,

      content: {
        ...sourcePage.content,
      },
    };

    const nextPages = [
      ...document.pages,
      duplicatedPage,
    ];

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          nextPages,
      };

    setDocument(
      nextDocument
    );

    sidebarSelectedPageIdRef.current =
      duplicatedPageId;

    setActivePageId(
      duplicatedPageId
    );

    setActivePhotoSlotId(
      duplicatedPhotos[0]?.id ??
      null
    );

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Swap Pages
  ========================================================================== */

  async function swapPages(
    sourcePageId:
      string,
    targetPageId:
      string
  ) {
    if (
      sourcePageId ===
        targetPageId
    ) {
      return;
    }

    const sourceIndex =
      document.pages.findIndex(
        (page) =>
          page.id ===
          sourcePageId
      );

    const targetIndex =
      document.pages.findIndex(
        (page) =>
          page.id ===
          targetPageId
      );

    if (
      sourceIndex < 0 ||
      targetIndex < 0
    ) {
      return;
    }

    const sourcePage =
      document.pages[
        sourceIndex
      ];

    const targetPage =
      document.pages[
        targetIndex
      ];

    if (
      !sourcePage ||
      !targetPage
    ) {
      return;
    }

    const nextPages = [
      ...document.pages,
    ];

    nextPages[
      sourceIndex
    ] =
      targetPage;

    nextPages[
      targetIndex
    ] =
      sourcePage;

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          nextPages,
      };

    setDocument(
      nextDocument
    );

    sidebarSelectedPageIdRef.current =
      sourcePageId;

    setActivePageId(
      sourcePageId
    );

    const activeSlotStillExists =
      sourcePage.photos.some(
        (photoSlot) =>
          photoSlot.id ===
          activePhotoSlotId
      );

    if (
      !activeSlotStillExists
    ) {
      setActivePhotoSlotId(
        sourcePage.photos[0]?.id ??
        null
      );
    }

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Delete Page
  ========================================================================== */

  async function deletePage(
    pageId:
      string
  ) {
    if (
      document.pages.length <=
        1
    ) {
      return;
    }

    const pageIndex =
      document.pages.findIndex(
        (page) =>
          page.id ===
          pageId
      );

    if (
      pageIndex < 0
    ) {
      return;
    }

    const nextPages =
      document.pages.filter(
        (page) =>
          page.id !==
          pageId
      );

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          nextPages,
      };

    setDocument(
      nextDocument
    );

    if (
      activePageId ===
        pageId
    ) {
      const nextActivePage =
        nextPages[
          Math.min(
            pageIndex,
            nextPages.length - 1
          )
        ];

      const nextActivePageId =
        nextActivePage?.id ??
        null;

      sidebarSelectedPageIdRef.current =
        nextActivePageId;

      setActivePageId(
        nextActivePageId
      );

      setActivePhotoSlotId(
        nextActivePage
          ?.photos[0]?.id ??
        null
      );
    }

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    addPage,
    changePageLayout,
    duplicatePage,
    swapPages,
    deletePage,
  };
}