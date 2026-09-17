import {
  Children,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  ReactNode,
} from "react";

import type {
  Book,
} from "@openpageflip/react";

import type {
  Frame,
} from "@openpageflip/core";

import useDigitalAlbumFlipSound
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/useDigitalAlbumFlipSound";


/* ==========================================================================
   Constants
========================================================================== */

const BASE_FONT_SIZE =
  16;

const GEOMETRY_EPSILON =
  0.5;

const MOBILE_BREAKPOINT =
  768;


/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumFlipBookProps {
  children:
    ReactNode;

  width:
    number;

  height:
    number;
}

interface ResponsiveMetrics {
  pageWidth:
    number;
}


/* ==========================================================================
   Digital Album Flip Book
========================================================================== */

export default function useDigitalAlbumFlipBook({
  children,
  width,
  height,
}: UseDigitalAlbumFlipBookProps) {
  /* ==========================================================================
     Refs
  ========================================================================== */

  const bookRef =
    useRef<Book>(
      null
    );


  /* ==========================================================================
     Flip Sound
  ========================================================================== */

  const {
    handleFlipSoundFrame,
  } =
    useDigitalAlbumFlipSound();


  /* ==========================================================================
     Pages
  ========================================================================== */

  const pageCount =
    Children.count(
      children
    );

  const lastPageIndex =
    pageCount - 1;


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    bookOffsetProgress,
    setBookOffsetProgress,
  ] =
    useState(
      -1
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

  const [
    isMobile,
    setIsMobile,
  ] =
    useState(
      false
    );

  const [
    canGoPrevious,
    setCanGoPrevious,
  ] =
    useState(
      false
    );

  const [
    canGoNext,
    setCanGoNext,
  ] =
    useState(
      true
    );


  /* ==========================================================================
     Responsive Layout
  ========================================================================== */

  useEffect(
    () => {
      const mediaQuery =
        window.matchMedia(
          `(max-width: ${MOBILE_BREAKPOINT}px)`
        );

      function handleChange() {
        setIsMobile(
          mediaQuery.matches
        );
      }

      handleChange();

      mediaQuery.addEventListener(
        "change",
        handleChange
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleChange
        );
      };
    },
    []
  );


  /* ==========================================================================
     Dimensions
  ========================================================================== */

  const actualPageWidth =
    responsiveMetrics.pageWidth;

  const bookOffset =
    isMobile
      ? 0
      : (
          actualPageWidth /
          2
        ) *
        bookOffsetProgress;

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

    "--album-book-offset":
      `${bookOffset}px`,

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

  function setPageWidth(
    nextPageWidth:
      number
  ) {
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

  function updateResponsiveGeometry() {
    const book =
      bookRef.current;

    if (!book) {
      return;
    }

    setPageWidth(
      book.rect.pageWidth
    );
  }


  /* ==========================================================================
     Lifecycle
  ========================================================================== */

  function handleInit() {
    updateResponsiveGeometry();

    const book =
      bookRef.current;

    if (
      book &&
      !isMobile
    ) {
      setBookOffsetProgress(
        book.page === 0
          ? -1
          : 0
      );
    }

    setCanGoPrevious(
      false
    );

    setCanGoNext(
      pageCount > 1
    );

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
       Flip Sound
    ======================================================================== */

    handleFlipSoundFrame(
      frame
    );


    /* ========================================================================
       Responsive Geometry
    ======================================================================== */

    setPageWidth(
      frame.rect.pageWidth
    );


    /* ========================================================================
       Navigation State
    ======================================================================== */

    if (!frame.flip) {
      const isFirstPage =
        frame.left === null &&
        frame.right === 0;

      const isLastPage =
        (
          frame.left ===
            lastPageIndex &&
          frame.right === null
        ) ||
        (
          isMobile &&
          frame.right ===
            lastPageIndex
        );

      setCanGoPrevious(
        !isFirstPage
      );

      setCanGoNext(
        !isLastPage
      );
    }


    /* ========================================================================
       Mobile
    ======================================================================== */

    if (isMobile) {
      return;
    }


    /* ========================================================================
       Book Position
    ======================================================================== */

    const flip =
      frame.flip;

    if (!flip) {
      const isFrontCover =
        frame.left === null &&
        frame.right === 0;

      const isBackCover =
        frame.left ===
          lastPageIndex &&
        frame.right === null;

      const nextOffsetProgress =
        isFrontCover
          ? -1
          : isBackCover
            ? 1
            : 0;

      setBookOffsetProgress(
        (currentProgress) =>
          currentProgress ===
          nextOffsetProgress
            ? currentProgress
            : nextOffsetProgress
      );

      return;
    }

    const progress =
      Math.max(
        0,
        Math.min(
          100,
          flip.progress
        )
      ) /
      100;


    /* ========================================================================
       Front Cover
    ======================================================================== */

    const isOpeningFrontCover =
      book.page === 0 &&
      flip.direction === "forward";

    const isClosingFrontCover =
      book.page <= 2 &&
      flip.direction === "back";

    if (
      isOpeningFrontCover ||
      isClosingFrontCover
    ) {
      setBookOffsetProgress(
        isOpeningFrontCover
          ? -1 + progress
          : -progress
      );

      return;
    }


    /* ========================================================================
       Back Cover
    ======================================================================== */

    const isClosingBackCover =
      flip.direction ===
        "forward" &&
      flip.flipping ===
        lastPageIndex;

    const isOpeningBackCover =
      flip.direction ===
        "back" &&
      book.page ===
        lastPageIndex;

    if (
      isClosingBackCover ||
      isOpeningBackCover
    ) {
      const nextOffsetProgress =
        isClosingBackCover
          ? progress
          : 1 - progress;

      setBookOffsetProgress(
        nextOffsetProgress
      );

      return;
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
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
  };
}