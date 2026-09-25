"use client";

import { useTranslations } from "next-intl";

import DigitalAlbumDesignPanel from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumDesignPanel/DigitalAlbumDesignPanel";

import DigitalAlbumPagesPanel from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel";

import DigitalAlbumPhotosPanel from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel";

import type { DigitalAlbumEditorStep } from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import type {
  DigitalAlbumDocumentPage,
  DigitalAlbumPageLayout,
  DigitalAlbumTheme,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import type { DigitalAlbumPhotoWithPhoto } from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import EditorSidebar from "@/features/editor/components/EditorSidebar/EditorSidebar";

import type { PhotoWall } from "@/features/invitations/types/photoWallPhoto.types";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorSidebarProps {
  beforeRemovePhoto?: (id: string) => Promise<boolean>;
  afterRemovePhoto?: () => void;
  albumId: string;

  activeStep: DigitalAlbumEditorStep;

  photos: DigitalAlbumPhotoWithPhoto[];

  photoWalls: PhotoWall[];

  pages: DigitalAlbumDocumentPage[];

  theme: DigitalAlbumTheme;

  activePageId: string | null;

  activePageNumber: number | null;

  activePageLayout: DigitalAlbumPageLayout | null;

  visiblePageIndexes: number[];

  selectedPhotoId: string | null;

  onSelectPhoto: (photoId: string) => void;

  onRemovePhotoFromPage: () => void;

  onSelectPage: (pageId: string) => void;

  onChangePageLayout: (pageId: string, layout: DigitalAlbumPageLayout) => void;

  onChangeTheme: (theme: DigitalAlbumTheme) => void;

  onAddPage: (layout: DigitalAlbumPageLayout) => void;

  onDuplicatePage: (pageId: string) => void;

  onDeletePage: (pageId: string) => void;

  onSwapPages: (sourcePageId: string, targetPageId: string) => void;
}

/* ==========================================================================
   Digital Album Editor Sidebar
========================================================================== */

export default function DigitalAlbumEditorSidebar({
  albumId,
  beforeRemovePhoto,
  afterRemovePhoto,
  activeStep,
  photos,
  photoWalls,
  pages,
  theme,
  activePageId,
  activePageNumber,
  activePageLayout,
  visiblePageIndexes,
  selectedPhotoId,
  onSelectPhoto,
  onRemovePhotoFromPage,
  onSelectPage,
  onChangePageLayout,
  onChangeTheme,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onSwapPages,
}: DigitalAlbumEditorSidebarProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t = useTranslations("DigitalAlbumEditor");

  /* ==========================================================================
     Title
  ========================================================================== */

  function getTitle() {
    switch (activeStep) {
      case "photos":
        return t("navigation.photos");

      case "pages":
        return t("navigation.pages");

      case "design":
      default:
        return t("navigation.design");
    }
  }

  /* ==========================================================================
     Content
  ========================================================================== */

  function renderContent() {
    switch (activeStep) {
      case "photos":
        return (
          <DigitalAlbumPhotosPanel
            beforeRemovePhoto={beforeRemovePhoto}
            afterRemovePhoto={afterRemovePhoto}
            albumId={albumId}
            photos={photos}
            photoWalls={photoWalls}
            activePageNumber={activePageNumber}
            selectedPhotoId={selectedPhotoId}
            onSelectPhoto={onSelectPhoto}
            onRemovePhotoFromPage={onRemovePhotoFromPage}
          />
        );

      case "pages":
        return (
          <DigitalAlbumPagesPanel
            pages={pages}
            photos={photos}
            activePageId={activePageId}
            visiblePageIndexes={visiblePageIndexes}
            onSelectPage={onSelectPage}
            onAddPage={onAddPage}
            onDuplicatePage={onDuplicatePage}
            onDeletePage={onDeletePage}
            onSwapPages={onSwapPages}
          />
        );

      case "design":
        return (
          <DigitalAlbumDesignPanel
            theme={theme}
            activePageId={activePageId}
            activePageLayout={activePageLayout}
            onChangePageLayout={onChangePageLayout}
            onChangeTheme={onChangeTheme}
          />
        );

      default:
        return null;
    }
  }

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorSidebar title={getTitle()} mobileScrollOwner="parent">
      {renderContent()}
    </EditorSidebar>
  );
}
