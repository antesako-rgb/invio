"use client";

import type {
  ReactNode,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  FlipBook,
} from "@openpageflip/react";

import "@openpageflip/core/styles.css";

import useDigitalAlbumFlipBook
  from "./useDigitalAlbumFlipBook";

import styles
  from "./DigitalAlbumFlipBook.module.css";


/* ==========================================================================
   Constants
========================================================================== */

const FLIP_DURATION =
  1000;


/* ==========================================================================
   Types
========================================================================== */
interface DigitalAlbumFlipBookProps {
  children:
    ReactNode;

  theme:
    string;

  width?:
    number;

  height?:
    number;

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
   Digital Album Flip Book
========================================================================== */
export default function DigitalAlbumFlipBook({
  children,
  theme,
  width = 480,
  height = 640,
  activePageIndex,
  onPageChange,
  onVisiblePagesChange,
}: DigitalAlbumFlipBookProps) {
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
  } =
    useDigitalAlbumFlipBook({
      children,
      width,
      height,
      activePageIndex,
      onVisiblePagesChange,
    });


  /* ==========================================================================
     Flip
  ========================================================================== */

  function handleFlip({
    page,
  }: {
    page:
      number;
  }) {
    onPageChange?.(
      page
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
<div
  ref={
    rootRef
  }
  className={
    styles.root
  }
  style={
    stageStyle
  }
  data-album-theme={
    theme
  }
>
      <button
        type="button"
        className={
          styles.previous
        }
        disabled={
          !canGoPrevious
        }
        aria-label="Previous page"
        onClick={
          handlePrevious
        }
      >
        <ChevronLeft
          aria-hidden="true"
        />
      </button>

      <div
        className={
          styles.stage
        }
      >
        <div
          className={
            styles.book
          }
        >
          <FlipBook
            ref={
              bookRef
            }
            width={
              width
            }
            height={
              height
            }
            size="stretch"
            layout={
              isMobile
                ? "single"
                : "spread"
            }
            cover={
              !isMobile
            }
            flipDuration={
              FLIP_DURATION
            }
            shadows={
              true
            }
            hoverCorners={
             false
            }
            onInit={
              handleInit
            }
            onUpdate={
              handleUpdate
            }
            onFlip={
              handleFlip
            }
            onFrame={
              handleFrame
            }
          >
            {children}
          </FlipBook>
        </div>
      </div>

      <button
        type="button"
        className={
          styles.next
        }
        disabled={
          !canGoNext
        }
        aria-label="Next page"
        onClick={
          handleNext
        }
      >
        <ChevronRight
          aria-hidden="true"
        />
      </button>
    </div>
  );
}