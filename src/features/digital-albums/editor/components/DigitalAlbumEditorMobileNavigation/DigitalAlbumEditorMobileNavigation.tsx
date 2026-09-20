"use client";

import {
  useTranslations,
} from "next-intl";

import {
  getDigitalAlbumEditorNavigationItems,
} from "@/features/digital-albums/editor/navigation/getDigitalAlbumEditorNavigationItems";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import EditorMobileNavigation
  from "@/features/editor/components/EditorMobileNavigation/EditorMobileNavigation";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorMobileNavigationProps {
  activeStep:
    DigitalAlbumEditorStep;

  onStepChange:
    (
      step:
        DigitalAlbumEditorStep
    ) => void;

  onOpenPanel:
    () => void;
}


/* ==========================================================================
   Digital Album Editor Mobile Navigation
========================================================================== */

export default function DigitalAlbumEditorMobileNavigation({
  activeStep,
  onStepChange,
  onOpenPanel,
}: DigitalAlbumEditorMobileNavigationProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbumEditor"
    );


  /* ==========================================================================
     Navigation
  ========================================================================== */

  const navigationItems =
    getDigitalAlbumEditorNavigationItems(
      t
    );


  /* ==========================================================================
     Handle Navigation
  ========================================================================== */

  function handleNavigation(
    id:
      string
  ) {
    if (
      id !== "photos" &&
      id !== "pages" &&
      id !== "design"
    ) {
      return;
    }

    onStepChange(
      id
    );

    onOpenPanel();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorMobileNavigation
      items={
        navigationItems
      }
      activeId={
        activeStep
      }
      ariaLabel={
        t(
          "navigation.label"
        )
      }
      onNavigate={
        handleNavigation
      }
    />
  );
}