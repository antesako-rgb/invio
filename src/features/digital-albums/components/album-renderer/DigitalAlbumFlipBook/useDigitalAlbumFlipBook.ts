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

  activePageIndex?:
    number;

  onVisiblePagesChange?:
    (
      pageIndexes:
        number[]
    ) => void;
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
  activePageIndex,
  onVisiblePagesChange,
}: UseDigitalAlbumFlipBookProps) {
  /* ==========================================================================
     Refs
  ========================================================================== */

  const rootRef =
    useRef<HTMLDivElement>(
      null
    );

  const bookRef =
    useRef<Book>(
      null
    );

  const pageWidthRef =
    useRef(
      width
    );

  const visiblePageIndexesRef =
    useRef<number[]>(
      []
    );

  const isFlippingRef =
    useRef(
      false
    );

  const currentPageIndexRef =
    useRef(
      0
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
      pageCount > 1
    );


  /* ==========================================================================
     Book Offset
  ========================================================================== */

  function setBookOffset(
    progress:
      number
  ) {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const offset =
      (
        pageWidthRef.current /
        2
      ) *
      progress;

    root.style.setProperty(
      "--album-book-offset",
      `${offset}px`
    );
  }


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
        const nextIsMobile =
          mediaQuery.matches;

        setIsMobile(
          nextIsMobile
        );

        if (
          nextIsMobile
        ) {
          setBookOffset(
            0
          );
        }
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

  const designFontSize =
    BASE_FONT_SIZE *
    (
      responsiveMetrics.pageWidth /
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
      "0px",

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

    if (
      Math.abs(
        pageWidthRef.current -
        nextPageWidth
      ) <
      GEOMETRY_EPSILON
    ) {
      return;
    }

    pageWidthRef.current =
      nextPageWidth;

    setResponsiveMetrics({
      pageWidth:
        nextPageWidth,
    });
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
    const book =
      bookRef.current;

    if (!book) {
      return;
    }

    updateResponsiveGeometry();

    currentPageIndexRef.current =
      book.page;

    setBookOffset(
      !isMobile &&
      book.page === 0
        ? -1
        : 0
    );

    setCanGoPrevious(
      book.page > 0
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
     Requested Page
  ========================================================================== */

  useEffect(
    () => {
      if (
        !isInitialized ||
        activePageIndex ===
          undefined
      ) {
        return;
      }

      const book =
        bookRef.current;

      if (
        !book ||
        isFlippingRef.current ||
        currentPageIndexRef.current ===
          activePageIndex
      ) {
        return;
      }

      isFlippingRef.current =
        true;

      void book
        .flipTo(
          activePageIndex
        )
        .then(
          (didFlip) => {
            if (
              !didFlip
            ) {
              isFlippingRef.current =
                false;
            }
          }
        )
        .catch(
          () => {
            isFlippingRef.current =
              false;
          }
        );
    },
    [
      activePageIndex,
      isInitialized,
    ]
  );


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function handlePrevious() {
    if (
      isFlippingRef.current
    ) {
      return;
    }

    isFlippingRef.current =
      true;

    void bookRef.current
      ?.flipPrev()
      .then(
        (didFlip) => {
          if (
            !didFlip
          ) {
            isFlippingRef.current =
              false;
          }
        }
      )
      .catch(
        () => {
          isFlippingRef.current =
            false;
        }
      );
  }

  function handleNext() {
    if (
      isFlippingRef.current
    ) {
      return;
    }

    isFlippingRef.current =
      true;

    void bookRef.current
      ?.flipNext()
      .then(
        (didFlip) => {
          if (
            !didFlip
          ) {
            isFlippingRef.current =
              false;
          }
        }
      )
      .catch(
        () => {
          isFlippingRef.current =
            false;
        }
      );
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

    handleFlipSoundFrame(
      frame
    );

    setPageWidth(
      frame.rect.pageWidth
    );


    /* ========================================================================
       Stable Frame
    ======================================================================== */

    if (!frame.flip) {
      isFlippingRef.current =
        false;

      currentPageIndexRef.current =
        book.page;

      const visiblePageIndexes = [
        frame.left,
        frame.right,
      ].filter(
        (
          pageIndex
        ): pageIndex is number =>
          pageIndex !== null
      );

      const previousVisiblePageIndexes =
        visiblePageIndexesRef.current;

      const haveVisiblePagesChanged =
        previousVisiblePageIndexes.length !==
          visiblePageIndexes.length ||
        previousVisiblePageIndexes.some(
          (
            pageIndex,
            index
          ) =>
            pageIndex !==
            visiblePageIndexes[index]
        );

      if (
        haveVisiblePagesChanged
      ) {
        visiblePageIndexesRef.current =
          visiblePageIndexes;

        onVisiblePagesChange?.(
          visiblePageIndexes
        );
      }

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
      setBookOffset(
        0
      );

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

      setBookOffset(
        isFrontCover
          ? -1
          : isBackCover
            ? 1
            : 0
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

    const isOpeningFrontCover =
      book.page === 0 &&
      flip.direction ===
        "forward";

    const isClosingFrontCover =
      book.page <= 2 &&
      flip.direction ===
        "back";

    if (
      isOpeningFrontCover ||
      isClosingFrontCover
    ) {
      setBookOffset(
        isOpeningFrontCover
          ? -1 + progress
          : -progress
      );

      return;
    }

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
      setBookOffset(
        isClosingBackCover
          ? progress
          : 1 - progress
      );
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
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
  };
}