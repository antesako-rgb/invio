"use client";
import {
  DIGITAL_ALBUM_PAGE_WIDTH as PAGE_WIDTH,
  DIGITAL_ALBUM_PAGE_HEIGHT as PAGE_HEIGHT,
} from "../../../config/digitalAlbumPageFormat";

import DigitalAlbumFlipBook from "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook";

import DigitalAlbumPage from "@/features/digital-albums/components/album-renderer/DigitalAlbumPage/DigitalAlbumPage";

import DigitalAlbumPageRenderer from "@/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer";

import type { DigitalAlbumRendererPhoto } from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageContent,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import "@/features/digital-albums/components/album-renderer/themes/DigitalAlbumPageTokens.css";
import "@/features/digital-albums/components/album-renderer/themes/classic/DigitalAlbumClassicTheme.css";

import styles from "./DigitalAlbumRenderer.module.css";

/* ==========================================================================
   Constants
========================================================================== */

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumRendererProps {
  editable?: boolean;
  document: DigitalAlbumDocument;

  photos: DigitalAlbumRendererPhoto[];

  activePageIndex?: number;

  activePhotoSlotId?: string | null;

  visiblePageIndexes?: number[];

  onSelectPhotoSlot?: (pageId: string, photoSlotId: string) => void;

  onPageContentChange?: (
    pageId: string,
    content: Partial<DigitalAlbumPageContent>,
  ) => void;

  onPageChange?: (pageIndex: number) => void;

  onVisiblePagesChange?: (pageIndexes: number[]) => void;

  onTurnStart?: () => void;
}

/* ==========================================================================
   Digital Album Renderer
========================================================================== */

export default function DigitalAlbumRenderer({
  document,
  photos,
  editable,
  activePageIndex,
  activePhotoSlotId,
  visiblePageIndexes = [],
  onSelectPhotoSlot,
  onPageContentChange,
  onPageChange,
  onVisiblePagesChange,
  onTurnStart,
}: DigitalAlbumRendererProps) {
  /* ==========================================================================
     Empty Document
  ========================================================================== */

  if (document.pages.length === 0) {
    return <div className={styles.page} />;
  }

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumFlipBook
      theme={document.theme}
      editable={editable ?? Boolean(onSelectPhotoSlot || onPageContentChange)}
      width={PAGE_WIDTH}
      height={PAGE_HEIGHT}
      activePageIndex={activePageIndex}
      onPageChange={onPageChange}
      onVisiblePagesChange={onVisiblePagesChange}
      onTurnStart={onTurnStart}
    >
      {document.pages.map((page, pageIndex) => {
        const isActivePage = pageIndex === activePageIndex;

        const isVisiblePage = visiblePageIndexes.includes(pageIndex);

        return (
          <DigitalAlbumPage
            key={page.id}
            hard={pageIndex === 0 || pageIndex === document.pages.length - 1}
          >
            <DigitalAlbumPageRenderer
              page={page}
              photos={photos}
              activePhotoSlotId={isActivePage ? activePhotoSlotId : null}
              onSelectPhotoSlot={
                isVisiblePage && onSelectPhotoSlot
                  ? (photoSlotId) => onSelectPhotoSlot(page.id, photoSlotId)
                  : undefined
              }
              onPageContentChange={
                isVisiblePage && onPageContentChange
                  ? (content) => onPageContentChange(page.id, content)
                  : undefined
              }
            />
          </DigitalAlbumPage>
        );
      })}
    </DigitalAlbumFlipBook>
  );
}
