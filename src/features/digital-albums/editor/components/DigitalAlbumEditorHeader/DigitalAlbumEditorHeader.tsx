"use client";

import {
  useTranslations,
} from "next-intl";

import BackLink
  from "@/components/ui/back-link/BackLink";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import {
  getDigitalAlbumEditorNavigationItems,
} from "@/features/digital-albums/editor/navigation/getDigitalAlbumEditorNavigationItems";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import EditorHeader
  from "@/features/editor/components/EditorHeader/EditorHeader";

import EditorSaveStatus
  from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorHeaderProps {
  activeStep:
    DigitalAlbumEditorStep;

  onStepChange:
    (
      step:
        DigitalAlbumEditorStep
    ) => void;
}


/* ==========================================================================
   Digital Album Editor Header
========================================================================== */

export default function DigitalAlbumEditorHeader({
  activeStep,
  onStepChange,
}: DigitalAlbumEditorHeaderProps) {
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
      id === "photos" ||
      id === "pages" ||
      id === "design"
    ) {
      onStepChange(
        id
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorHeader
      start={
        <BackLink
          href="/dashboard/dogadaji"
          label={
            t(
              "navigation.back"
            )
          }
        />
      }
      navigation={
        <SideNavigation
          items={
            navigationItems
          }
          variant="controlled"
          appearance="underline"
          activeId={
            activeStep
          }
          onControlledNavigate={
            handleNavigation
          }
          ariaLabel={
            t(
              "navigation.label"
            )
          }
        />
      }
      end={
        <EditorSaveStatus
          status="saved"
          savingLabel={
            t(
              "status.saving"
            )
          }
          savedLabel={
            t(
              "status.saved"
            )
          }
          errorLabel={
            t(
              "status.error"
            )
          }
        />
      }
    />
  );
}