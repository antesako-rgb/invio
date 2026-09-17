"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  type Book,
  FlipBook,
} from "@openpageflip/react";

import type {
  Frame,
} from "@openpageflip/core";

import "@openpageflip/core/styles.css";

import styles
  from "./DigitalAlbumFlipBook.module.css";


/* ==========================================================================
   Constants
========================================================================== */

const FLIP_DURATION =
  1000;

const BASE_FONT_SIZE =
  16;

const GEOMETRY_EPSILON =
  0.5;


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

interface ResponsiveMetrics {
  pageWidth:
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
  /* ==========================================================================
     Refs
  ========================================================================== */

  const bookRef =
    useRef<Book>(
      null
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    coverProgress,
    setCoverProgress,
  ] =
    useState(
      0
    );

  const [
    responsiveMetrics,
    setResponsiveMetrics,
  ] =
    useState<ResponsiveMetrics>({
      pageWidth:
        width,
    });

  const [
    isInitialized,
    setIsInitialized,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Dimensions
  ========================================================================== */

  const actualPageWidth =
    responsiveMetrics.pageWidth;

  const coverOffset =
    actualPageWidth / 2;

  const designFontSize =
    BASE_FONT_SIZE *
    (
      actualPageWidth /
      width
    );

  const stageStyle = {
    "--album-page-width":
      `${width}px`,

    "--album-page-height":
      `${height}px`,

    "--album-spread-width":
      `${width * 2}px`,

    "--album-cover-offset":
      `${coverOffset}px`,

    "--album-cover-progress":
      coverProgress,

    "--album-design-font-size":
      `${designFontSize}px`,

    "--album-initialized":
      isInitialized
        ? 1
        : 0,
  } as CSSProperties;


  /* ==========================================================================
     Responsive Geometry
  ========================================================================== */

  function updateResponsiveGeometry() {
    const book =
      bookRef.current;

    if (!book) {
      return;
    }

    const nextPageWidth =
      book.rect.pageWidth;

    if (
      !Number.isFinite(
        nextPageWidth
      ) ||
      nextPageWidth <= 0
    ) {
      return;
    }

    setResponsiveMetrics(
      (currentMetrics) => {
        const hasWidthChanged =
          Math.abs(
            currentMetrics.pageWidth -
            nextPageWidth
          ) >=
          GEOMETRY_EPSILON;

        if (!hasWidthChanged) {
          return currentMetrics;
        }

        return {
          pageWidth:
            nextPageWidth,
        };
      }
    );
  }


  /* ==========================================================================
     Lifecycle
  ========================================================================== */

  function handleInit() {
    updateResponsiveGeometry();

    setIsInitialized(
      true
    );
  }

  function handleUpdate() {
    updateResponsiveGeometry();
  }


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function handlePrevious() {
    void bookRef.current?.flipPrev();
  }

  function handleNext() {
    void bookRef.current?.flipNext();
  }


  /* ==========================================================================
     Frame
  ========================================================================== */

  function handleFrame({
    frame,
  }: {
    frame:
      Frame;
  }) {
    const book =
      bookRef.current;

    if (!book) {
      return;
    }


    /* ========================================================================
       Responsive Geometry
    ======================================================================== */

    const nextPageWidth =
      frame.rect.pageWidth;

    if (
      Number.isFinite(
        nextPageWidth
      ) &&
      nextPageWidth > 0
    ) {
      setResponsiveMetrics(
        (currentMetrics) => {
          const hasWidthChanged =
            Math.abs(
              currentMetrics.pageWidth -
              nextPageWidth
            ) >=
            GEOMETRY_EPSILON;

          if (!hasWidthChanged) {
            return currentMetrics;
          }

          return {
            pageWidth:
              nextPageWidth,
          };
        }
      );
    }


    /* ========================================================================
       Cover Progress
    ======================================================================== */

    const flip =
      frame.flip;

    if (!flip) {
      const nextProgress =
        book.page === 0
          ? 0
          : 100;

      setCoverProgress(
        (currentProgress) =>
          currentProgress ===
          nextProgress
            ? currentProgress
            : nextProgress
      );

      return;
    }

    const isOpeningFrontCover =
      book.page === 0 &&
      flip.direction === "forward";

    const isClosingFrontCover =
      book.page <= 2 &&
      flip.direction === "back";

    if (
      !isOpeningFrontCover &&
      !isClosingFrontCover
    ) {
      return;
    }

    const progress =
      Math.max(
        0,
        Math.min(
          100,
          flip.progress
        )
      );

    const nextProgress =
      isOpeningFrontCover
        ? progress
        : 100 - progress;

    setCoverProgress(
      (currentProgress) =>
        currentProgress ===
        nextProgress
          ? currentProgress
          : nextProgress
    );
  }


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
              cover
              flipDuration={
                FLIP_DURATION
              }
              shadows={
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
      </div>
    </div>
  );
}