"use client";

import {
  useTranslations,
} from "next-intl";

import BackLink
  from "@/components/ui/back-link/BackLink";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import EditorHeader
  from "@/features/editor/components/EditorHeader/EditorHeader";

import EditorSaveStatus
  from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";

import {
  getEventExperienceEditorNavigationItems,
} from "@/features/invitations/editor/navigation/getEventExperienceEditorNavigationItems";

import type {
  EventExperienceEditorSaveStatus,
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

interface EventExperienceEditorHeaderProps {
  type:
    EventExperienceType;

  activeStep:
    EventExperienceEditorStep;

  features:
    EventExperienceTemplateFeaturesConfig;

  saveStatus?:
    EventExperienceEditorSaveStatus;

  onStepChange:
    (
      step:
        EventExperienceEditorStep
    ) => void;

  onPreview?:
    () => void;
}


/* ==========================================================================
   Event Experience Editor Header
========================================================================== */

export default function EventExperienceEditorHeader({
  type,
  activeStep,
  features,
  saveStatus = "saved",
  onStepChange,
  onPreview,
}: EventExperienceEditorHeaderProps) {
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
      onPreview?.();

      return;
    }

    if (
      id === "design"
    ) {
      onStepChange(
        id
      );

      return;
    }

    if (
      id === "details" &&
      hasDetails
    ) {
      onStepChange(
        id
      );

      return;
    }

    if (
      id === "rsvp" &&
      hasRsvp
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
          status={
            saveStatus
          }
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