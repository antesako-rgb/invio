"use client";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

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

  const [
    section,
    setSection,
  ] =
    useState<DigitalAlbumDesignSection>(
      "page"
    );


  /* ==========================================================================
     Tabs
  ========================================================================== */

  const tabItems = [
    {
      value:
        "page",

      label:
        t(
          "tabs.page"
        ),
    },
    {
      value:
        "theme",

      label:
        t(
          "tabs.theme"
        ),
    },
  ];


  /* ==========================================================================
     Change Section
  ========================================================================== */

  function handleSectionChange(
    value:
      string
  ) {
    setSection(
      value as
        DigitalAlbumDesignSection
    );
  }


  /* ==========================================================================
     Change Layout
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
      <TabsFilter
        items={
          tabItems
        }
        value={
          section
        }
        onValueChange={
          handleSectionChange
        }
        equalWidth
      />

      {section ===
        "page" && (
        <DigitalAlbumLayoutPicker
          value={
            activePageLayout
          }
          onChange={
            handleChangeLayout
          }
        />
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