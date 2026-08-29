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
  offsetBottom?: number;
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


  /* ==========================================================================
     Scroll Visibility
  ========================================================================== */

  useEffect(() => {
    function handleScroll() {
      setVisible(
        window.scrollY > 400
      );
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  /* ==========================================================================
     Scroll To Top
  ========================================================================== */

  function scrollToTop() {
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
        t("backToTop")
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