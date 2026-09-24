"use client";

import DigitalAlbumPageRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type {
  DigitalAlbumDocument,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import styles
  from "./DigitalAlbumPrintRenderer.module.css";

import "@/features/digital-albums/components/album-renderer/themes/classic/DigitalAlbumClassicTheme.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPrintRendererProps {
  document:
    DigitalAlbumDocument;

  photos:
    DigitalAlbumRendererPhoto[];
}


/* ==========================================================================
   Digital Album Print Renderer
========================================================================== */

export default function DigitalAlbumPrintRenderer({
  document,
  photos,
}: DigitalAlbumPrintRendererProps) {
  return (
    <div
      className={
        styles.root
      }
      data-album-theme={
        document.theme
      }
    >
      {document.pages.map(
        (page) => (
          <div
            key={
              page.id
            }
            className={
              styles.page
            }
          >
            <DigitalAlbumPageRenderer
              page={
                page
              }
              photos={
                photos
              }
            />
          </div>
        )
      )}
    </div>
  );
}