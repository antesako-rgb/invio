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

  width?:
    number;

  height?:
    number;
}


/* ==========================================================================
   Digital Album Flip Book
========================================================================== */

export default function DigitalAlbumFlipBook({
  children,
  width = 480,
  height = 640,
}: DigitalAlbumFlipBookProps) {
  const {
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
    });


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      style={
        stageStyle
      }
    >
      <div
        className={
          styles.stage
        }
      >
        {canGoPrevious && (
          <button
            type="button"
            className={`${styles.navigation} ${styles.navigationPrevious}`}
            aria-label="Prethodna stranica"
            onClick={
              handlePrevious
            }
          >
            <ChevronLeft />
          </button>
        )}

        <div
          className={
            styles.bookStage
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
                false
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
              onFrame={
                handleFrame
              }
            >
              {children}
            </FlipBook>
          </div>
        </div>

        {canGoNext && (
          <button
            type="button"
            className={`${styles.navigation} ${styles.navigationNext}`}
            aria-label="Sljedeća stranica"
            onClick={
              handleNext
            }
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}