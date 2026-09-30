"use client";

import type { ReactNode } from "react";


import {
  useTranslations,
} from "next-intl";



import DigitalAlbumLayoutPicker
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumLayoutPicker/DigitalAlbumLayoutPicker";

import DigitalAlbumThemePicker
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumThemePicker/DigitalAlbumThemePicker";

import type {
  DigitalAlbumPageLayout,
  DigitalAlbumTheme,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";

import styles
  from "./DigitalAlbumDesignPanel.module.css";


/* ==========================================================================
   Types
========================================================================== */

type DigitalAlbumDesignSection =
  | "page"
  | "theme";

interface DigitalAlbumDesignPanelProps {
  section: DigitalAlbumDesignSection;
  pageControls?: ReactNode;
  theme:
    DigitalAlbumTheme;

  activePageId:
    string | null;

  activePageLayout:
    DigitalAlbumPageLayout | null;

  onChangePageLayout:
    (
      pageId:
        string,
      layout:
        DigitalAlbumPageLayout
    ) => void;

  onChangeTheme:
    (
      theme:
        DigitalAlbumTheme
    ) => void;
}


/* ==========================================================================
   Digital Album Design Panel
========================================================================== */

export default function DigitalAlbumDesignPanel({
  theme,
  section,
  pageControls,
  activePageId,
  activePageLayout,
  onChangePageLayout,
  onChangeTheme,
}: DigitalAlbumDesignPanelProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor.design"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  function handleChangeLayout(
    layout:
      DigitalAlbumPageLayout
  ) {
    if (
      !activePageId
    ) {
      return;
    }

    onChangePageLayout(
      activePageId,
      layout
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
    >

      {section ===
        "page" && (
        <>
        {pageControls}
        <h3 className={styles.title}>{t("tabs.page")}</h3>
        <DigitalAlbumLayoutPicker
          value={
            activePageLayout
          }
          onChange={
            handleChangeLayout
          }
        />
        </>
      )}

      {section ===
        "theme" && (
        <DigitalAlbumThemePicker
          value={
            theme
          }
          onChange={
            onChangeTheme
          }
        />
      )}
    </div>
  );
}
