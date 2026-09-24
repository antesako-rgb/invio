"use client";

import { useEffect, useRef } from "react";

import DigitalAlbumPageRenderer from "@/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer";

import type { DigitalAlbumRendererPhoto } from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type { DigitalAlbumDocument } from "@/features/digital-albums/types/digitalAlbumDocument.types";

import "@/features/digital-albums/components/album-renderer/themes/DigitalAlbumPageTokens.css";
import "@/features/digital-albums/components/album-renderer/themes/classic/DigitalAlbumClassicTheme.css";

import styles from "./DigitalAlbumPrintRenderer.module.css";



/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPrintRendererProps {
  document: DigitalAlbumDocument;

  photos: DigitalAlbumRendererPhoto[];
}

/* ==========================================================================
   Digital Album Print Renderer
========================================================================== */

export default function DigitalAlbumPrintRenderer({
  document,
  photos,
}: DigitalAlbumPrintRendererProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (root) root.dataset.albumPrintHydrated = "true";
    return () => {
      if (root) delete root.dataset.albumPrintHydrated;
    };
  }, [document, photos]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-album-theme={document.theme}
    >
      {document.pages.map((page) => (
        <div data-album-page={page.id} key={page.id} className={styles.page}>
          <DigitalAlbumPageRenderer page={page} photos={photos} />
        </div>
      ))}
    </div>
  );
}
