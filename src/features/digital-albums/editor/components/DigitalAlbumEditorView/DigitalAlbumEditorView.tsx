"use client";

import {
  useState,
} from "react";

import DigitalAlbumRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import DigitalAlbumEditor
  from "@/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor";

import DigitalAlbumEditorSidebar
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar";

import useDigitalAlbumEditor
  from "@/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumEditor";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageContent,
  DigitalAlbumPageLayout,
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
     State
  ========================================================================== */

  const [
    activeStep,
    setActiveStep,
  ] =
    useState<DigitalAlbumEditorStep>(
      "photos"
    );


  /* ==========================================================================
     Editor
  ========================================================================== */

  const editor =
    useDigitalAlbumEditor({
      albumId,
      initialDocument,
      documentVersion,
    });


  /* ==========================================================================
     Renderer Photos
  ========================================================================== */

  const rendererPhotos:
    DigitalAlbumRendererPhoto[] =
      photos.map(
        (albumPhoto) => ({
          id:
            albumPhoto.photo_id,

          imagePath:
            albumPhoto.photo.image_path,

          description:
            albumPhoto.description,
        })
      );


  /* ==========================================================================
     Active Page
  ========================================================================== */

  const activePage =
    editor.activePageIndex >= 0
      ? editor.document.pages[
          editor.activePageIndex
        ]
      : undefined;

  const activePageLayout =
    activePage?.layout ??
    null;


/* ==========================================================================
   Add Page
========================================================================== */

async function handleAddPage(
  layout:
    DigitalAlbumPageLayout
) {
  await editor.addPage(
    layout
  );

  setActiveStep(
    "photos"
  );
}


/* ==========================================================================
   Select Photo Slot
========================================================================== */

function handleSelectPhotoSlot(
  pageId:
    string,
  photoSlotId:
    string
) {
  editor.selectPhotoSlot(
    pageId,
    photoSlotId
  );

  const page =
    editor.document.pages.find(
      (item) =>
        item.id ===
        pageId
    );

  const photoSlot =
    page?.photos.find(
      (item) =>
        item.id ===
        photoSlotId
    );

  if (
    !photoSlot?.photoId
  ) {
    setActiveStep(
      "photos"
    );
  }
}

/* ==========================================================================
   Page Content
========================================================================== */

async function handlePageContentChange(
  pageId:
    string,
  content:
    Partial<DigitalAlbumPageContent>
) {
  await editor.updatePageContent(
    pageId,
    content
  );
}
  /* ==========================================================================
     Photo Actions
  ========================================================================== */

  async function handleSelectPhoto(
    photoId:
      string
  ) {
    if (
      !editor.activePhotoSlotId
    ) {
      return;
    }

    await editor.selectPhoto(
      editor.activePhotoSlotId,
      photoId
    );
  }

  async function handleRemovePhotoFromPage() {
    if (
      !editor.activePhotoSlotId
    ) {
      return;
    }

    await editor.removePhotoFromPage(
      editor.activePhotoSlotId
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
        setActiveStep
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
    editor.document.pages
  }
  theme={
    editor.document.theme
  }
  activePageId={
    editor.activePageId
  }
  activePageNumber={
    editor.activePageNumber
  }
  activePageLayout={
    activePageLayout
  }
  visiblePageIndexes={
    editor.visiblePageIndexes
  }
  selectedPhotoId={
    editor.selectedPhotoId
  }
  onSelectPhoto={
    handleSelectPhoto
  }
  onRemovePhotoFromPage={
    handleRemovePhotoFromPage
  }
  onSelectPage={
    editor.selectPage
  }
  onChangePageLayout={
    editor.changePageLayout
  }
  onChangeTheme={
    editor.changeTheme
  }
  onAddPage={
    handleAddPage
  }
  onDuplicatePage={
    editor.duplicatePage
  }
  onDeletePage={
    editor.deletePage
  }
  onSwapPages={
    editor.swapPages
  }
/>
      }
    >
<DigitalAlbumRenderer
  document={
    editor.document
  }
  photos={
    rendererPhotos
  }
  activePageIndex={
    editor.activePageIndex >= 0
      ? editor.activePageIndex
      : undefined
  }
  activePhotoSlotId={
    editor.activePhotoSlotId
  }
  visiblePageIndexes={
    editor.visiblePageIndexes
  }
  onSelectPhotoSlot={
    handleSelectPhotoSlot
  }
  onPageContentChange={
    handlePageContentChange
  }
  onPageChange={
    editor.handleFlipBookPageChange
  }
  onVisiblePagesChange={
    editor.handleVisiblePagesChange
  }
/>
    </DigitalAlbumEditor>
  );
}