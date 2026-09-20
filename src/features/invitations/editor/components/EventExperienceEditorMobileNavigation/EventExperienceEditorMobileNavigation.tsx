"use client";

import {
  useTranslations,
} from "next-intl";

import EditorMobileNavigation
  from "@/features/editor/components/EditorMobileNavigation/EditorMobileNavigation";

import {
  getEventExperienceEditorNavigationItems,
} from "@/features/invitations/editor/navigation/getEventExperienceEditorNavigationItems";

import type {
  EventExperienceEditorStep,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceTemplateFeaturesConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorMobileNavigationProps {
  type:
    EventExperienceType;

  activeStep:
    EventExperienceEditorStep;

  features:
    EventExperienceTemplateFeaturesConfig;

  onStepChange:
    (
      step:
        EventExperienceEditorStep
    ) => void;

  onPreview:
    () => void;

  onOpenPanel:
    () => void;

  onClosePanel:
    () => void;
}


/* ==========================================================================
   Event Experience Editor Mobile Navigation
========================================================================== */

export default function EventExperienceEditorMobileNavigation({
  type,
  activeStep,
  features,
  onStepChange,
  onPreview,
  onOpenPanel,
  onClosePanel,
}: EventExperienceEditorMobileNavigationProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.editor"
    );


  /* ==========================================================================
     Capabilities
  ========================================================================== */

  const hasDetails =
    type === "invitation" &&
    features.details;

  const hasRsvp =
    type === "invitation" &&
    features.rsvp;


  /* ==========================================================================
     Navigation
  ========================================================================== */

  const navigationItems =
    getEventExperienceEditorNavigationItems(
      t,
      {
        hasDetails,
        hasRsvp,
      }
    );


  /* ==========================================================================
     Handle Navigation
  ========================================================================== */

  function handleNavigation(
    id:
      string
  ) {
    if (
      id === "preview"
    ) {
      onClosePanel();

      onPreview();

      return;
    }

    if (
      id === "design"
    ) {
      onStepChange(
        id
      );

      onOpenPanel();

      return;
    }

    if (
      id === "details" &&
      hasDetails
    ) {
      onStepChange(
        id
      );

      onOpenPanel();

      return;
    }

    if (
      id === "rsvp" &&
      hasRsvp
    ) {
      onStepChange(
        id
      );

      onOpenPanel();
    }
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