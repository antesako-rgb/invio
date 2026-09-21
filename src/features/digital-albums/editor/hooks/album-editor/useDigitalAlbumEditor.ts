"use client";

import {
  useRef,
  useState,
} from "react";

import {
  updateDigitalAlbumDocumentAction,
} from "@/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction";

import useDigitalAlbumPageActions
  from "@/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPageActions";

import useDigitalAlbumPhotoActions
  from "@/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPhotoActions";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageContent,
  DigitalAlbumTheme,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";
/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumEditorOptions {
  albumId:
    string;

  initialDocument:
    DigitalAlbumDocument;

  documentVersion:
    number;
}


/* ==========================================================================
   Use Digital Album Editor
========================================================================== */

export default function useDigitalAlbumEditor({
  albumId,
  initialDocument,
  documentVersion,
}: UseDigitalAlbumEditorOptions) {
  /* ==========================================================================
     Document
  ========================================================================== */

  const [
    document,
    setDocument,
  ] =
    useState<DigitalAlbumDocument>(
      initialDocument
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    activePageId,
    setActivePageId,
  ] =
    useState<string | null>(
      () =>
        initialDocument.pages[0]?.id ??
        null
    );

  const [
    activePhotoSlotId,
    setActivePhotoSlotId,
  ] =
    useState<string | null>(
      () =>
        initialDocument.pages[0]
          ?.photos[0]?.id ??
        null
    );

  const [
    visiblePageIndexes,
    setVisiblePageIndexes,
  ] =
    useState<number[]>(
      () =>
        initialDocument.pages.length > 0
          ? [0]
          : []
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const sidebarSelectedPageIdRef =
    useRef<string | null>(
      null
    );

  const visiblePageSelectionRef =
    useRef<string | null>(
      null
    );


  /* ==========================================================================
     Active Page
  ========================================================================== */

  const activePageIndex =
    document.pages.findIndex(
      (page) =>
        page.id ===
        activePageId
    );

  const activePage =
    activePageIndex >= 0
      ? document.pages[
          activePageIndex
        ]
      : undefined;

  const activePageNumber =
    activePageIndex >= 0
      ? activePageIndex + 1
      : null;


  /* ==========================================================================
     Active Photo Slot
  ========================================================================== */

  const activePhotoSlot =
    activePage?.photos.find(
      (photoSlot) =>
        photoSlot.id ===
        activePhotoSlotId
    );

  const selectedPhotoId =
    activePhotoSlot?.photoId ??
    null;


  /* ==========================================================================
     Save
  ========================================================================== */

  async function saveDocument(
    nextDocument:
      DigitalAlbumDocument
  ) {
    setIsSaving(
      true
    );

    try {
      const result =
        await updateDigitalAlbumDocumentAction({
          albumId,

          document:
            nextDocument,

          documentVersion,
        });

      if (
        !result.success
      ) {
        console.error(
          "Digital album document save error:",
          result.message
        );
      }
    } finally {
      setIsSaving(
        false
      );
    }
  }

/* ==========================================================================
   Theme
========================================================================== */

async function changeTheme(
  theme:
    DigitalAlbumTheme
) {
  if (
    document.theme ===
    theme
  ) {
    return;
  }

  const nextDocument:
    DigitalAlbumDocument = {
      ...document,

      theme,
  };

  setDocument(
    nextDocument
  );

  await saveDocument(
    nextDocument
  );
}
/* ==========================================================================
   Page Content
========================================================================== */

async function updatePageContent(
  pageId:
    string,
  content:
    Partial<DigitalAlbumPageContent>
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

  const nextPages =
    document.pages.map(
      (page) =>
        page.id ===
          pageId
          ? {
              ...page,

              content: {
                ...page.content,
                ...content,
              },
            }
          : page
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

  await saveDocument(
    nextDocument
  );
}
  /* ==========================================================================
     Photo Actions
  ========================================================================== */

  const {
    selectPhoto,
    removePhotoFromPage,
  } =
    useDigitalAlbumPhotoActions({
      document,
      activePageId,
      setDocument,
      saveDocument,
    });


  /* ==========================================================================
     Page Actions
  ========================================================================== */

  const {
    addPage,
    changePageLayout,
    duplicatePage,
    swapPages,
    deletePage,
  } =
    useDigitalAlbumPageActions({
      document,
      activePageId,
      activePhotoSlotId,
      setDocument,
      setActivePageId,
      setActivePhotoSlotId,
      sidebarSelectedPageIdRef,
      saveDocument,
    });


  /* ==========================================================================
     Page Selection
  ========================================================================== */

  function selectPage(
    pageId:
      string
  ) {
    const page =
      document.pages.find(
        (item) =>
          item.id ===
          pageId
      );

    if (
      !page
    ) {
      return;
    }

    visiblePageSelectionRef.current =
      null;

    sidebarSelectedPageIdRef.current =
      pageId;

    setActivePageId(
      pageId
    );

    setActivePhotoSlotId(
      page.photos[0]?.id ??
      null
    );
  }


  /* ==========================================================================
     Photo Slot Selection
  ========================================================================== */

  function selectPhotoSlot(
    pageId:
      string,
    photoSlotId:
      string
  ) {
    const pageIndex =
      document.pages.findIndex(
        (page) =>
          page.id ===
          pageId
      );

    if (
      pageIndex < 0 ||
      !visiblePageIndexes.includes(
        pageIndex
      )
    ) {
      return;
    }

    const page =
      document.pages[
        pageIndex
      ];

    if (
      !page
    ) {
      return;
    }

    const photoSlot =
      page.photos.find(
        (item) =>
          item.id ===
          photoSlotId
      );

    if (
      !photoSlot
    ) {
      return;
    }

    sidebarSelectedPageIdRef.current =
      null;

    visiblePageSelectionRef.current =
      pageId;

    setActivePageId(
      pageId
    );

    setActivePhotoSlotId(
      photoSlotId
    );
  }


  /* ==========================================================================
     FlipBook
  ========================================================================== */

  function handleFlipBookPageChange(
    pageIndex:
      number
  ) {
    const visibleSelectedPageId =
      visiblePageSelectionRef.current;

    if (
      visibleSelectedPageId
    ) {
      visiblePageSelectionRef.current =
        null;

      return;
    }

    const selectedPageId =
      sidebarSelectedPageIdRef.current;

    if (
      selectedPageId
    ) {
      const selectedPageIndex =
        document.pages.findIndex(
          (page) =>
            page.id ===
            selectedPageId
        );

      const selectedSpreadStartIndex =
        selectedPageIndex <= 0
          ? 0
          : selectedPageIndex % 2 === 0
            ? selectedPageIndex - 1
            : selectedPageIndex;

      if (
        pageIndex ===
        selectedSpreadStartIndex
      ) {
        sidebarSelectedPageIdRef.current =
          null;

        return;
      }
    }

    const page =
      document.pages[
        pageIndex
      ];

    if (
      !page
    ) {
      return;
    }

    setActivePageId(
      (currentPageId) =>
        currentPageId ===
          page.id
          ? currentPageId
          : page.id
    );

    setActivePhotoSlotId(
      page.photos[0]?.id ??
      null
    );
  }


  /* ==========================================================================
     Visible Pages
  ========================================================================== */

  function handleVisiblePagesChange(
    pageIndexes:
      number[]
  ) {
    setVisiblePageIndexes(
      (currentPageIndexes) => {
        const isSame =
          currentPageIndexes.length ===
            pageIndexes.length &&
          currentPageIndexes.every(
            (
              pageIndex,
              index
            ) =>
              pageIndex ===
              pageIndexes[index]
          );

        return isSame
          ? currentPageIndexes
          : pageIndexes;
      }
    );
  }


  /* ==========================================================================
     Return
  ========================================================================== */

return {
  document,

  activePageId,
  activePageIndex,
  activePageNumber,

  activePhotoSlotId,

  visiblePageIndexes,

  selectedPhotoId,

  isSaving,

  selectPhoto,
  removePhotoFromPage,

  selectPage,
  selectPhotoSlot,

  addPage,
  changePageLayout,
  duplicatePage,
  deletePage,
  swapPages,

  changeTheme,
  updatePageContent,

  handleFlipBookPageChange,
  handleVisiblePagesChange,
};
}