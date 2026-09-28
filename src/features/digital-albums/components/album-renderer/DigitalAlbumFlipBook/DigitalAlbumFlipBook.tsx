"use client";
import { digitalAlbumFonts } from "../themes/digitalAlbumFonts";


import { useTranslations } from "next-intl";

import { useImperativeHandle, type ReactNode, type Ref } from "react";

export interface DigitalAlbumNavigation {
  previous: () => void;
  next: () => void;
  goTo: (pageIndex: number) => void;
}

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FlipBook } from "@openpageflip/react";

import "@openpageflip/core/styles.css";

import useDigitalAlbumFlipBook from "./useDigitalAlbumFlipBook";

import styles from "./DigitalAlbumFlipBook.module.css";

/* ==========================================================================
   Constants
========================================================================== */

const FLIP_DURATION = 1000;

/* ==========================================================================
   Types
========================================================================== */
interface DigitalAlbumFlipBookProps {
  navigationRef?: Ref<DigitalAlbumNavigation>;
  soundEnabled?: boolean;
  editable?: boolean;
  children: ReactNode;

  theme: string;

  width?: number;

  height?: number;

  activePageIndex?: number;

  onPageChange?: (pageIndex: number) => void;

  onVisiblePagesChange?: (pageIndexes: number[]) => void;

  onTurnStart?: () => void;
}

/* ==========================================================================
   Digital Album Flip Book
========================================================================== */
export default function DigitalAlbumFlipBook({
  children,
  soundEnabled = true,
  navigationRef,
  theme,
  editable = false,
  width = 440,
  height = 640,
  activePageIndex,
  onPageChange,
  onVisiblePagesChange,
  onTurnStart,
}: DigitalAlbumFlipBookProps) {
  const t = useTranslations("DigitalAlbumEditor.navigation");
  /* ==========================================================================
     Flip Book
  ========================================================================== */

  const {
    rootRef,
    bookRef,
    isMobile,
    stageStyle,
    canGoPrevious,
    canGoNext,
    handleInit,
    handleUpdate,
    handleFrame,
    handlePrevious,
    handleNext,
    handleGoTo,
  } = useDigitalAlbumFlipBook({
    soundEnabled,
    children,
    width,
    height,
    activePageIndex,
    onVisiblePagesChange,
    onTurnStart,
  });

  useImperativeHandle(navigationRef, () => ({
    previous: handlePrevious,
    next: handleNext,
    goTo: handleGoTo,
  }));

  /* ==========================================================================
     Flip
  ========================================================================== */

  function handleFlip({ page }: { page: number }) {
    onPageChange?.(page);
  }

  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${digitalAlbumFonts}`}
      style={stageStyle}
      data-album-theme={theme}
    >
      <button
        type="button"
        className={styles.previous}
        disabled={!canGoPrevious}
        aria-label={t("previousPage")}
        onClick={handlePrevious}
      >
        <ChevronLeft aria-hidden="true" />
      </button>

      <div className={styles.stage}>
        <div className={styles.book}>
          <FlipBook
            ref={bookRef}
            width={width}
            height={height}
            size="stretch"
            click={editable ? "off" : "anywhere"}
            ignoreDragOn="a, button:not([data-album-photo-select]), input, textarea, select, [contenteditable=true], [data-opf-no-flip]"
            layout={isMobile ? "single" : "spread"}
            cover={!isMobile}
            flipDuration={FLIP_DURATION}
            shadows={true}
            hoverCorners={false}
            onInit={handleInit}
            onUpdate={handleUpdate}
            onFlip={handleFlip}
            onFrame={handleFrame}
          >
            {children}
          </FlipBook>
        </div>
      </div>

      <button
        type="button"
        className={styles.next}
        disabled={!canGoNext}
        aria-label={t("nextPage")}
        onClick={handleNext}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
