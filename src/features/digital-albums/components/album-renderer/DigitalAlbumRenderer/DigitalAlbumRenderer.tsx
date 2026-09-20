"use client";

import DigitalAlbumFlipBook
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook";

import DigitalAlbumFullPhotoLayout
  from "@/features/digital-albums/components/album-renderer/layouts/DigitalAlbumFullPhotoLayout/DigitalAlbumFullPhotoLayout";

import DigitalAlbumPage
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPage/DigitalAlbumPage";

import {
  getEventPhotoUrl,
} from "@/features/event-photos/utils/getEventPhotoUrl";

import type {
  DigitalAlbumPhotoWithPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";

import type {
  DigitalAlbumDocument,
  DigitalAlbumDocumentPage,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import styles
  from "./DigitalAlbumRenderer.module.css";


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
    DigitalAlbumPhotoWithPhoto[];

  activePageIndex?:
    number;

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
  onPageChange,
  onVisiblePagesChange,
}: DigitalAlbumRendererProps) {
  /* ==========================================================================
     Photo
  ========================================================================== */

  function getPhotoUrl(
    photoId:
      string | null
  ): string | null {
    if (
      !photoId
    ) {
      return null;
    }

    const albumPhoto =
      photos.find(
        (item) =>
          item.photo_id ===
          photoId
      );

    if (
      !albumPhoto
    ) {
      return null;
    }

    return getEventPhotoUrl(
      albumPhoto.photo.image_path
    );
  }


  /* ==========================================================================
     Page Content
  ========================================================================== */

  function renderPageContent(
    page:
      DigitalAlbumDocumentPage
  ) {
    if (
      page.layout ===
        "full-photo"
    ) {
      const imageUrl =
        getPhotoUrl(
          page.photos[0]?.photoId ??
          null
        );

      if (
        imageUrl
      ) {
        return (
          <DigitalAlbumFullPhotoLayout
            imageUrl={
              imageUrl
            }
            description={
              page.content.text
            }
          />
        );
      }
    }

    return (
      <div
        className={
          styles.page
        }
        data-album-page-layout={
          page.layout
        }
      >
        {page.content.subtitle && (
          <span
            className={
              styles.subtitle
            }
          >
            {page.content.subtitle}
          </span>
        )}

        {page.content.title && (
          <h2
            className={
              styles.title
            }
          >
            {page.content.title}
          </h2>
        )}

        {page.content.text && (
          <p
            className={
              styles.text
            }
          >
            {page.content.text}
          </p>
        )}
      </div>
    );
  }


  /* ==========================================================================
     Page
  ========================================================================== */

  function renderPage(
    page:
      DigitalAlbumDocumentPage
  ) {
    return (
      <DigitalAlbumPage
        key={
          page.id
        }
      >
        {renderPageContent(
          page
        )}
      </DigitalAlbumPage>
    );
  }


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
        renderPage
      )}
    </DigitalAlbumFlipBook>
  );
}