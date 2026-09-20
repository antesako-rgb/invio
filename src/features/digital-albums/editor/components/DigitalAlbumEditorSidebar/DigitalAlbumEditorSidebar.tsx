"use client";

import {
  useTranslations,
} from "next-intl";

import DigitalAlbumPagesPanel
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel";

import DigitalAlbumPhotosPanel
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import type {
  DigitalAlbumDocumentPage,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import EditorSidebar
  from "@/features/editor/components/EditorSidebar/EditorSidebar";

import type {
  PhotoWall,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorSidebarProps {
  albumId:
    string;

  activeStep:
    DigitalAlbumEditorStep;

  photos:
    DigitalAlbumPhotoWithPhoto[];

  photoWalls:
    PhotoWall[];

  pages:
    DigitalAlbumDocumentPage[];

  activePageId:
    string | null;

  activePageNumber:
    number | null;

  visiblePageIndexes:
    number[];

  selectedPhotoId:
    string | null;

  onSelectPhoto:
    (
      photoId:
        string
    ) => void;

  onSelectPage:
    (
      pageId:
        string
    ) => void;

  onAddPage:
    () => void;
}


/* ==========================================================================
   Digital Album Editor Sidebar
========================================================================== */

export default function DigitalAlbumEditorSidebar({
  albumId,
  activeStep,
  photos,
  photoWalls,
  pages,
  activePageId,
  activePageNumber,
  visiblePageIndexes,
  selectedPhotoId,
  onSelectPhoto,
  onSelectPage,
  onAddPage,
}: DigitalAlbumEditorSidebarProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor"
    );


  /* ==========================================================================
     Title
  ========================================================================== */

  function getTitle() {
    switch (
      activeStep
    ) {
      case "photos":
        return t(
          "navigation.photos"
        );

      case "pages":
        return t(
          "navigation.pages"
        );

      case "design":
      default:
        return t(
          "navigation.design"
        );
    }
  }


  /* ==========================================================================
     Content
  ========================================================================== */

  function renderContent() {
    switch (
      activeStep
    ) {
      case "photos":
        return (
          <DigitalAlbumPhotosPanel
            albumId={
              albumId
            }
            photos={
              photos
            }
            photoWalls={
              photoWalls
            }
            activePageNumber={
              activePageNumber
            }
            selectedPhotoId={
              selectedPhotoId
            }
            onSelectPhoto={
              onSelectPhoto
            }
          />
        );

      case "pages":
        return (
          <DigitalAlbumPagesPanel
            pages={
              pages
            }
            photos={
              photos
            }
            activePageId={
              activePageId
            }
            visiblePageIndexes={
              visiblePageIndexes
            }
            onSelectPage={
              onSelectPage
            }
            onAddPage={
              onAddPage
            }
          />
        );

      case "design":
      default:
        return null;
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorSidebar
      title={
        getTitle()
      }
    >
      {renderContent()}
    </EditorSidebar>
  );
}