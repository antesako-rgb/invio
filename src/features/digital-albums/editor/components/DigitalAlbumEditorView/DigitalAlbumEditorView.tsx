"use client";

import {
  useState,
} from "react";

import {
  updateDigitalAlbumDocumentAction,
} from "@/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction";

import DigitalAlbumRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer";

import DigitalAlbumEditor
  from "@/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor";

import DigitalAlbumEditorSidebar
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import type {
  DigitalAlbumDocument,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import type {
  PhotoWall,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorViewProps {
  albumId:
    string;

  document:
    DigitalAlbumDocument;

  documentVersion:
    number;

  photos:
    DigitalAlbumPhotoWithPhoto[];

  photoWalls:
    PhotoWall[];
}


/* ==========================================================================
   Digital Album Editor View
========================================================================== */

export default function DigitalAlbumEditorView({
  albumId,
  document:
    initialDocument,
  documentVersion,
  photos,
  photoWalls,
}: DigitalAlbumEditorViewProps) {
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
    activeStep,
    setActiveStep,
  ] =
    useState<DigitalAlbumEditorStep>(
      "photos"
    );

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

  const selectedPhotoId =
    activePage?.photos[0]?.photoId ??
    null;


  /* ==========================================================================
     Save Document
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
     Step
  ========================================================================== */

  function handleStepChange(
    step:
      DigitalAlbumEditorStep
  ) {
    setActiveStep(
      step
    );
  }


  /* ==========================================================================
     Photo
  ========================================================================== */

  async function handleSelectPhoto(
    photoId:
      string
  ) {
    if (
      !activePageId
    ) {
      return;
    }

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages:
          document.pages.map(
            (page) => {
              if (
                page.id !==
                  activePageId
              ) {
                return page;
              }

              const photoSlot =
                page.photos[0];

              if (
                !photoSlot
              ) {
                return page;
              }

              return {
                ...page,

                photos: [
                  {
                    ...photoSlot,

                    photoId,
                  },

                  ...page.photos.slice(
                    1
                  ),
                ],
              };
            }
          ),
      };

    setDocument(
      nextDocument
    );

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Page
  ========================================================================== */

  function handleSelectPage(
    pageId:
      string
  ) {
    setActivePageId(
      pageId
    );

    const page =
      document.pages.find(
        (item) =>
          item.id ===
          pageId
      );

    const photoId =
      page?.photos[0]?.photoId ??
      null;

    if (
      !photoId
    ) {
      setActiveStep(
        "photos"
      );
    }
  }

  function handleFlipBookPageChange(
    pageIndex:
      number
  ) {
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
      page.id
    );
  }

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

    if (
      isSame
    ) {
      return currentPageIndexes;
    }

    return pageIndexes;
  }
);
}

  async function handleAddPage() {
    const pageId =
      crypto.randomUUID();

    const photoSlotId =
      crypto.randomUUID();

    const nextDocument:
      DigitalAlbumDocument = {
        ...document,

        pages: [
          ...document.pages,
          {
            id:
              pageId,

            layout:
              "full-photo",

            photos: [
              {
                id:
                  photoSlotId,

                photoId:
                  null,
              },
            ],

            content: {},
          },
        ],
      };

    setDocument(
      nextDocument
    );

    setActivePageId(
      pageId
    );

    setActiveStep(
      "photos"
    );

    await saveDocument(
      nextDocument
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumEditor
      activeStep={
        activeStep
      }
      onStepChange={
        handleStepChange
      }
      sidebar={
       <DigitalAlbumEditorSidebar
  albumId={
    albumId
  }
  activeStep={
    activeStep
  }
  photos={
    photos
  }
  photoWalls={
    photoWalls
  }
  pages={
    document.pages
  }
  activePageId={
    activePageId
  }
  activePageNumber={
    activePageNumber
  }
  visiblePageIndexes={
    visiblePageIndexes
  }
  selectedPhotoId={
    selectedPhotoId
  }
  onSelectPhoto={
    handleSelectPhoto
  }
  onSelectPage={
    handleSelectPage
  }
  onAddPage={
    handleAddPage
  }
/>
      }
    >
      <DigitalAlbumRenderer
        document={
          document
        }
        photos={
          photos
        }
        activePageIndex={
          activePageIndex >= 0
            ? activePageIndex
            : undefined
        }
        onPageChange={
          handleFlipBookPageChange
        }
        onVisiblePagesChange={
          handleVisiblePagesChange
        }
      />
    </DigitalAlbumEditor>
  );
}