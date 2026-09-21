"use client";

import DigitalAlbumFlipBook
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook";

import DigitalAlbumPage
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPage/DigitalAlbumPage";

import DigitalAlbumPageRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageContent,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import styles
  from "./DigitalAlbumRenderer.module.css";

import "@/features/digital-albums/components/album-renderer/themes/classic/DigitalAlbumClassicTheme.css";


/* ==========================================================================
   Constants
========================================================================== */

const PAGE_WIDTH =
  480;

const PAGE_HEIGHT =
  640;


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumRendererProps {
  document:
    DigitalAlbumDocument;

  photos:
    DigitalAlbumRendererPhoto[];

  activePageIndex?:
    number;

  activePhotoSlotId?:
    string | null;

  visiblePageIndexes?:
    number[];

  onSelectPhotoSlot?:
    (
      pageId:
        string,
      photoSlotId:
        string
    ) => void;

  onPageContentChange?:
    (
      pageId:
        string,
      content:
        Partial<DigitalAlbumPageContent>
    ) => void;

  onPageChange?:
    (
      pageIndex:
        number
    ) => void;

  onVisiblePagesChange?:
    (
      pageIndexes:
        number[]
    ) => void;
}


/* ==========================================================================
   Digital Album Renderer
========================================================================== */

export default function DigitalAlbumRenderer({
  document,
  photos,
  activePageIndex,
  activePhotoSlotId,
  visiblePageIndexes = [],
  onSelectPhotoSlot,
  onPageContentChange,
  onPageChange,
  onVisiblePagesChange,
}: DigitalAlbumRendererProps) {
  /* ==========================================================================
     Empty Document
  ========================================================================== */

  if (
    document.pages.length ===
      0
  ) {
    return (
      <div
        className={
          styles.page
        }
      />
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumFlipBook
      theme={
        document.theme
      }
      width={
        PAGE_WIDTH
      }
      height={
        PAGE_HEIGHT
      }
      activePageIndex={
        activePageIndex
      }
      onPageChange={
        onPageChange
      }
      onVisiblePagesChange={
        onVisiblePagesChange
      }
    >
      {document.pages.map(
        (
          page,
          pageIndex
        ) => {
          const isActivePage =
            pageIndex ===
            activePageIndex;

          const isVisiblePage =
            visiblePageIndexes.includes(
              pageIndex
            );

          return (
            <DigitalAlbumPage
              key={
                page.id
              }
            >
              <DigitalAlbumPageRenderer
                page={
                  page
                }
                photos={
                  photos
                }
                activePhotoSlotId={
                  isActivePage
                    ? activePhotoSlotId
                    : null
                }
                onSelectPhotoSlot={
                  isVisiblePage &&
                  onSelectPhotoSlot
                    ? (
                        photoSlotId
                      ) =>
                        onSelectPhotoSlot(
                          page.id,
                          photoSlotId
                        )
                    : undefined
                }
                onPageContentChange={
                  isVisiblePage &&
                  onPageContentChange
                    ? (
                        content
                      ) =>
                        onPageContentChange(
                          page.id,
                          content
                        )
                    : undefined
                }
              />
            </DigitalAlbumPage>
          );
        }
      )}
    </DigitalAlbumFlipBook>
  );
}