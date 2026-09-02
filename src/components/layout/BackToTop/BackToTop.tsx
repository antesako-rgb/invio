"use client";

import type {
  CSSProperties,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowUp,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import styles from "./BackToTop.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface BackToTopProps {
  offsetBottom?:
    number;
}


/* ==========================================================================
   Helpers
========================================================================== */

function getScrollContainer() {
  const elements =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "body *"
      )
    );

  return (
    elements.find(
      (element) => {
        const style =
          window.getComputedStyle(
            element
          );

        const isScrollable =
          style.overflowY === "auto" ||
          style.overflowY === "scroll";

        return (
          isScrollable &&
          element.scrollHeight >
            element.clientHeight
        );
      }
    ) ?? null
  );
}


/* ==========================================================================
   Back To Top
========================================================================== */

export default function BackToTop({
  offsetBottom = 24,
}: BackToTopProps) {
  const t =
    useTranslations(
      "Common"
    );

  const [
    visible,
    setVisible,
  ] =
    useState(false);

  const [
    scrollContainer,
    setScrollContainer,
  ] =
    useState<HTMLElement | null>(
      null
    );


  /* ==========================================================================
     Scroll Container
  ========================================================================== */

  useEffect(() => {
    setScrollContainer(
      getScrollContainer()
    );
  }, []);


  /* ==========================================================================
     Scroll Visibility
  ========================================================================== */

  useEffect(() => {
    function handleScroll() {
      const scrollTop =
        scrollContainer
          ? scrollContainer.scrollTop
          : window.scrollY;

      setVisible(
        scrollTop > 400
      );
    }

    const target =
      scrollContainer ??
      window;

    target.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      target.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    scrollContainer,
  ]);


  /* ==========================================================================
     Scroll To Top
  ========================================================================== */

  function scrollToTop() {
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <button
      type="button"
      aria-label={
        t(
          "backToTop"
        )
      }
      onClick={
        scrollToTop
      }
      style={
        {
          "--bottom-offset":
            `${offsetBottom}px`,
        } as CSSProperties
      }
      className={
        `${styles.button} ${
          visible
            ? styles.visible
            : ""
        }`
      }
    >
      <ArrowUp
        size={20}
        aria-hidden="true"
      />
    </button>
  );
}