"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import {
  useRouter,
} from "@/i18n/navigation";

import {
  isEventType,
} from "@/features/events/types/event.types";

import type {
  Event,
} from "@/features/events/types/event.types";

import {
  createEventExperienceAction,
} from "@/features/invitations/actions/experience/createEventExperienceAction";

import {
  updateEventExperienceAction,
} from "@/features/invitations/actions/experience/updateEventExperienceAction";

import {
  getEventExperienceTemplateConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import {
  createInitialEventExperienceContent,
} from "@/features/invitations/content/createInitialEventExperienceContent";

import {
  getEventExperienceEditorFallback,
} from "@/features/invitations/editor/data/EventExperienceEditorFallbacks";

import {
  parseEventExperienceContent,
} from "@/features/invitations/renderer/parsers/parseEventExperienceContent";

import {
  parseEventExperiencePresentation,
} from "@/features/invitations/renderer/parsers/parseEventExperiencePresentation";

import type {
  EventExperience,
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface SelectedTemplate {
  type:
    EventExperienceType;

  templateId:
    string;

  variantId:
    string;
}

interface UseEventExperienceTemplateActionsOptions {
  eventId:
    string;

  event:
    Event;

  experiences:
    EventExperience[];
}


/* ==========================================================================
   Use Event Experience Template Actions
========================================================================== */

export function useEventExperienceTemplateActions({
  eventId,
  event,
  experiences,
}: UseEventExperienceTemplateActionsOptions) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperienceTemplates"
    );

  const tEventContent =
    useTranslations(
      "EventExperienceContent"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] =
    useState<SelectedTemplate | null>(
      null
    );

  const [
    isUseDialogOpen,
    setIsUseDialogOpen,
  ] =
    useState(false);

  const [
    isCreating,
    setIsCreating,
  ] =
    useState(false);

  const [
    isUpdating,
    setIsUpdating,
  ] =
    useState(false);

  const [
    creatingTemplateId,
    setCreatingTemplateId,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const isCreatingRef =
    useRef(false);

  const isUpdatingRef =
    useRef(false);


  /* ==========================================================================
     Pending
  ========================================================================== */

  const isPending =
    isCreating ||
    isUpdating;


  /* ==========================================================================
     Selected Template Config
  ========================================================================== */

  const selectedTemplateConfig =
    useMemo(
      () => {
        if (!selectedTemplate) {
          return null;
        }

        return getEventExperienceTemplateConfig(
          selectedTemplate.type,
          selectedTemplate.templateId
        );
      },
      [
        selectedTemplate,
      ]
    );


  /* ==========================================================================
     Compatible Experiences
  ========================================================================== */

  const compatibleExperiences =
    useMemo(
      () => {
        if (!selectedTemplate) {
          return [];
        }

        return experiences.filter(
          (experience) =>
            experience.type ===
            selectedTemplate.type
        );
      },
      [
        experiences,
        selectedTemplate,
      ]
    );


  /* ==========================================================================
     Content Translation Key
  ========================================================================== */

  function getContentTranslationKey(
    experienceType:
      EventExperienceType,
    field:
      | "heroTitle"
      | "heroSubtitle"
      | "description"
  ) {
    if (
      event.type ===
        "wedding"
    ) {
      return `${event.type}.${experienceType}.${field}`;
    }

    return `${event.type}.${field}`;
  }


  /* ==========================================================================
     Create Event Experience
  ========================================================================== */

  async function createEventExperience(
    experienceType: EventExperienceType,
    templateId: string,
    variantId: string
  ) {
    if (
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    isCreatingRef.current =
      true;

    setIsCreating(
      true
    );

    setCreatingTemplateId(
      templateId
    );

    try {
      if (
        !isEventType(
          event.type
        )
      ) {
        throw new Error(
          `Unsupported event type: ${event.type}`
        );
      }

      const template =
        getEventExperienceTemplateConfig(
          experienceType,
          templateId
        );

      if (!template) {
        throw new Error(
          `Unknown event experience template: ${experienceType}/${templateId}`
        );
      }

      const eventFallback =
        getEventExperienceEditorFallback(
          event.type
        );

      const result =
        await createEventExperienceAction({
          eventId:
            eventId,

          name:
            t(
              `newTemplateName.${experienceType}`
            ),

          type:
            experienceType,

          templateId:
            templateId,

          variantId:
            variantId,

          content:
            createInitialEventExperienceContent(
              event,
              {
                primaryName:
                  eventFallback.primaryName,

                secondaryName:
                  eventFallback.secondaryName,

                heroTitle:
                  tEventContent(
                    getContentTranslationKey(
                      experienceType,
                      "heroTitle"
                    )
                  ),

                heroSubtitle:
                  tEventContent(
                    getContentTranslationKey(
                      experienceType,
                      "heroSubtitle"
                    )
                  ),

                firstInitial:
                  eventFallback.firstInitial,

                secondInitial:
                  eventFallback.secondInitial,

                description:
                  tEventContent(
                    getContentTranslationKey(
                      experienceType,
                      "description"
                    )
                  ),
              }
            ),

          presentation:
            {},
        });

      if (!result.success) {
        isCreatingRef.current =
          false;

        setIsCreating(
          false
        );

        setCreatingTemplateId(
          null
        );

        toast.error(
          result.message
        );

        return;
      }

      setIsUseDialogOpen(
        false
      );

      router.push(
        `/editor/pozivnice/${result.data.id}/uredi`
      );
    } catch (error) {
      isCreatingRef.current =
        false;

      setIsCreating(
        false
      );

      setCreatingTemplateId(
        null
      );

      throw error;
    }
  }


  /* ==========================================================================
     Select Template
  ========================================================================== */

  async function selectTemplate(
    experienceType: EventExperienceType,
    templateId: string,
    variantId: string
  ) {
    if (
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    const template =
      getEventExperienceTemplateConfig(
        experienceType,
        templateId
      );

    if (!template) {
      return;
    }

    const hasCompatibleExperience =
      experiences.some(
        (experience) =>
          experience.type ===
          experienceType
      );

    if (!hasCompatibleExperience) {
      await createEventExperience(
        experienceType,
        templateId,
        variantId
      );

      return;
    }

    setSelectedTemplate({
      type:
        experienceType,

      templateId,

      variantId,
    });

    setIsUseDialogOpen(
      true
    );
  }


  /* ==========================================================================
     Apply Existing
  ========================================================================== */

  async function applyExisting(
    experienceId: string
  ) {
    if (
      !selectedTemplate ||
      !selectedTemplateConfig ||
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    const experience =
      experiences.find(
        (experience) =>
          experience.id ===
          experienceId
      );

    if (!experience) {
      return;
    }

    if (
      experience.type !==
        selectedTemplate.type
    ) {
      return;
    }

    isUpdatingRef.current =
      true;

    setIsUpdating(
      true
    );

    try {
      const content =
        parseEventExperienceContent(
          experience.content
        );

      const presentation =
        parseEventExperiencePresentation(
          experience.presentation
        );

      const result =
        await updateEventExperienceAction({
          experienceId:
            experience.id,

          name:
            experience.name,

          templateId:
            selectedTemplate.templateId,

          variantId:
            selectedTemplate.variantId,

          content:
            content,

          presentation:
            presentation,
        });

      if (!result.success) {
        isUpdatingRef.current =
          false;

        setIsUpdating(
          false
        );

        toast.error(
          result.message
        );

        return;
      }

      setIsUseDialogOpen(
        false
      );

      router.push(
        `/editor/pozivnice/${result.data.id}/uredi`
      );
    } catch (error) {
      isUpdatingRef.current =
        false;

      setIsUpdating(
        false
      );

      throw error;
    }
  }


  /* ==========================================================================
     Create New
  ========================================================================== */

  async function createNew() {
    if (
      !selectedTemplate ||
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    await createEventExperience(
      selectedTemplate.type,
      selectedTemplate.templateId,
      selectedTemplate.variantId
    );
  }


  /* ==========================================================================
     Dialog
  ========================================================================== */

  function setUseDialogOpen(
    open: boolean
  ) {
    if (isPending) {
      return;
    }

    setIsUseDialogOpen(
      open
    );

    if (!open) {
      setSelectedTemplate(
        null
      );
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    selectedTemplate,
    compatibleExperiences,
    isUseDialogOpen,
    isCreating,
    isUpdating,
    isPending,
    creatingTemplateId,
    selectTemplate,
    applyExisting,
    createNew,
    setUseDialogOpen,
  };
}