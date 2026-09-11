"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import type {
  EventType,
} from "@/features/events/types/event.types";

import {
  getEventExperienceTemplateConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import EventExperienceEditor
  from "@/features/invitations/editor/components/EventExperienceEditor/EventExperienceEditor";

import EventExperienceEditorPreview
  from "@/features/invitations/editor/components/EventExperienceEditorPreview/EventExperienceEditorPreview";

import EventExperienceEditorSidebar
  from "@/features/invitations/editor/components/EventExperienceEditorSidebar/EventExperienceEditorSidebar";

import EventExperienceEditorToolbar
  from "@/features/invitations/editor/components/EventExperienceEditorToolbar/EventExperienceEditorToolbar";

import {
  buildEventExperienceEditorContent,
} from "@/features/invitations/editor/data/buildEventExperienceEditorContent";

import {
  getEventExperienceEditorFallback,
} from "@/features/invitations/editor/data/EventExperienceEditorFallbacks";

import {
  INVITATION_EDITOR_PREVIEW_GUESTS,
} from "@/features/invitations/editor/data/InvitationEditorPreviewGuests";

import type {
  EventExperienceEditorEventTranslations,
} from "@/features/invitations/editor/data/EventExperienceEditorFallback.types";

import {
  useEventExperienceAutosave,
} from "@/features/invitations/editor/hooks/useEventExperienceAutosave";

import type {
  EventExperienceEditorSelection,
  EventExperienceEditorStep,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import {
  buildEventExperienceDateDisplay,
} from "@/features/invitations/renderer/display/buildEventExperienceDateDisplay";

import {
  buildEventExperienceLocationDisplay,
} from "@/features/invitations/renderer/display/buildEventExperienceLocationDisplay";

import {
  buildEventExperienceTimeDisplay,
} from "@/features/invitations/renderer/display/buildEventExperienceTimeDisplay";

import EventExperienceRenderer
  from "@/features/invitations/renderer/EventExperienceRenderer";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";

import type {
  EventExperienceRenderData,
  GenericInvitationRsvpSubmitHandler,
  InvitationRsvpSubmitHandler,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import type {
  InvitationRSVPPreviewMode,
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorViewProps {
  experienceId:
    string;

  experienceName:
    string;

  templateId:
    string;

  variantId:
    string;

  eventType:
    EventType;

  locale:
    string;

  data:
    EventExperienceRenderData;
}


/* ==========================================================================
   Event Experience Editor View
========================================================================== */

export default function EventExperienceEditorView({
  experienceId,
  experienceName,
  templateId,
  variantId,
  eventType,
  locale,
  data,
}: EventExperienceEditorViewProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const tFallback =
    useTranslations(
      "EventExperiences.editor.fallback"
    );

  const tInvitationFallback =
    useTranslations(
      "Invitations.editor.fallback"
    );

  const tEventContent =
    useTranslations(
      "EventExperienceContent"
    );


  /* ==========================================================================
     Template
  ========================================================================== */

  const template =
    getEventExperienceTemplateConfig(
      data.type,
      templateId
    );

  if (!template) {
    return null;
  }

  const features =
    template.features;


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    activeStep,
    setActiveStep,
  ] =
    useState<EventExperienceEditorStep>(
      "design"
    );

  const [
    rsvpPreviewState,
    setRsvpPreviewState,
  ] =
    useState<InvitationRSVPViewState>(
      "form"
    );

  const [
    rsvpPreviewMode,
    setRsvpPreviewMode,
  ] =
    useState<InvitationRSVPPreviewMode>(
      "personalized"
    );

  const [
    selectedElement,
    setSelectedElement,
  ] =
    useState<
      EventExperienceEditorSelection | null
    >(
      null
    );

  const [
    editingElement,
    setEditingElement,
  ] =
    useState<
      EventExperienceEditorSelection | null
    >(
      null
    );

  const [
    content,
    setContent,
  ] =
    useState<EventExperienceContent>(
      data.content
    );

  const [
    presentation,
    setPresentation,
  ] =
    useState<EventExperiencePresentation>(
      data.presentation
    );

  const [
    isPreviewOpen,
    setIsPreviewOpen,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Fallback Translations
  ========================================================================== */

  const fallbackTranslations =
    useMemo(
      () => ({
        locationName:
          tFallback(
            "locationName"
          ),

        locationAddress:
          tFallback(
            "locationAddress"
          ),

        rsvpTitle:
          tInvitationFallback(
            "rsvpTitle"
          ),

        rsvpDescription:
          tInvitationFallback(
            "rsvpDescription"
          ),
      }),
      [
        tFallback,
        tInvitationFallback,
      ]
    );


  /* ==========================================================================
     Event Translations
  ========================================================================== */

  const eventTranslations =
    useMemo<
      EventExperienceEditorEventTranslations
    >(
      () => {
        const contentPath =
          eventType ===
            "wedding"
            ? `${eventType}.${data.type}`
            : eventType;

        return {
          heroTitle:
            tEventContent(
              `${contentPath}.heroTitle`
            ),

          heroSubtitle:
            tEventContent(
              `${contentPath}.heroSubtitle`
            ),

          description:
            tEventContent(
              `${contentPath}.description`
            ),
        };
      },
      [
        eventType,
        data.type,
        tEventContent,
      ]
    );


  /* ==========================================================================
     Event Fallback
  ========================================================================== */

  const eventFallback =
    useMemo(
      () =>
        getEventExperienceEditorFallback(
          eventType
        ),
      [
        eventType,
      ]
    );


  /* ==========================================================================
     Autosave
  ========================================================================== */

  const saveStatus =
    useEventExperienceAutosave({
      experienceId,
      experienceName,
      templateId,
      variantId,
      content,
      presentation,
    });


  /* ==========================================================================
     Step
  ========================================================================== */

  function handleStepChange(
    step:
      EventExperienceEditorStep
  ) {
    setSelectedElement(
      null
    );

    setEditingElement(
      null
    );

    setActiveStep(
      step
    );
  }


  /* ==========================================================================
     Editing
  ========================================================================== */

  function handleStartEdit(
    element:
      EventExperienceEditorSelection
  ) {
    setSelectedElement(
      element
    );

    setEditingElement(
      element
    );
  }

  function handleEndEdit() {
    setEditingElement(
      null
    );
  }


  /* ==========================================================================
     RSVP Preview
  ========================================================================== */

  const handleRsvpPreviewSubmit:
    InvitationRsvpSubmitHandler =
    () => {
      setRsvpPreviewState(
        "success"
      );
    };

  const handleGenericRsvpPreviewSubmit:
    GenericInvitationRsvpSubmitHandler =
    () => {
      setRsvpPreviewState(
        "success"
      );
    };


  /* ==========================================================================
     RSVP Preview Mode
  ========================================================================== */

  useEffect(
    () => {
      if (
        content.rsvp.allow_generic_responses
      ) {
        return;
      }

      if (
        rsvpPreviewMode !==
          "generic"
      ) {
        return;
      }

      setRsvpPreviewMode(
        "personalized"
      );
    },
    [
      content.rsvp.allow_generic_responses,
      rsvpPreviewMode,
    ]
  );


  /* ==========================================================================
     Preview
  ========================================================================== */

  function handleOpenPreview() {
    setSelectedElement(
      null
    );

    setEditingElement(
      null
    );

    setIsPreviewOpen(
      true
    );
  }

  function handleClosePreview() {
    setIsPreviewOpen(
      false
    );
  }


  /* ==========================================================================
     Clear Selection
  ========================================================================== */

  useEffect(
    () => {
      function handlePointerDown(
        event:
          PointerEvent
      ) {
        const target =
          event.target;

        if (
          !(target instanceof Element)
        ) {
          return;
        }

        if (
          target.closest(
            "[data-editor-element]"
          )
        ) {
          return;
        }

        if (
          target.closest(
            "[data-event-experience-editor-toolbar]"
          )
        ) {
          return;
        }

        if (
          target.closest(
            "[data-event-experience-editor-ui]"
          )
        ) {
          return;
        }

        setSelectedElement(
          null
        );

        setEditingElement(
          null
        );
      }

      document.addEventListener(
        "pointerdown",
        handlePointerDown
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          handlePointerDown
        );
      };
    },
    []
  );


  /* ==========================================================================
     Editor Render Data
  ========================================================================== */

  const editorRenderData =
    useMemo<EventExperienceRenderData>(
      () => {
        const editorContent =
          buildEventExperienceEditorContent(
            content,
            fallbackTranslations,
            eventTranslations,
            eventFallback
          );

        return {
          type:
            data.type,

          content:
            editorContent,

          presentation,

          display: {
            date:
              buildEventExperienceDateDisplay(
                editorContent.date,
                locale
              ),

            time:
              buildEventExperienceTimeDisplay(
                editorContent.time
              ),

            location:
              buildEventExperienceLocationDisplay(
                editorContent.location
              ),
          },

          eventTimezone:
            data.eventTimezone,

          invitation:
            data.type ===
              "invitation" &&
            features.rsvp
              ? {
                  guests:
                    INVITATION_EDITOR_PREVIEW_GUESTS,

                  rsvpPreviewState,

                  rsvpPreviewMode,

                  onRsvpPreviewModeChange:
                    setRsvpPreviewMode,

                  onSubmitRsvp:
                    handleRsvpPreviewSubmit,

                  onSubmitGenericRsvp:
                    handleGenericRsvpPreviewSubmit,
                }
              : undefined,

          photoWall:
            data.photoWall,
        };
      },
      [
        content,
        presentation,
        locale,
        fallbackTranslations,
        eventTranslations,
        eventFallback,
        data.type,
        data.eventTimezone,
        data.photoWall,
        features.rsvp,
        rsvpPreviewState,
        rsvpPreviewMode,
      ]
    );


  /* ==========================================================================
     Preview Render Data
  ========================================================================== */

  const previewRenderData =
    useMemo<EventExperienceRenderData>(
      () => ({
        type:
          data.type,

        content,

        presentation,

        display: {
          date:
            buildEventExperienceDateDisplay(
              content.date,
              locale
            ),

          time:
            buildEventExperienceTimeDisplay(
              content.time
            ),

          location:
            buildEventExperienceLocationDisplay(
              content.location
            ),
        },

        eventTimezone:
          data.eventTimezone,

        invitation:
          data.type ===
            "invitation" &&
          features.rsvp
            ? {
                guests:
                  INVITATION_EDITOR_PREVIEW_GUESTS,

                rsvpPreviewState,

                rsvpPreviewMode,

                onRsvpPreviewModeChange:
                  setRsvpPreviewMode,

                onSubmitRsvp:
                  handleRsvpPreviewSubmit,

                onSubmitGenericRsvp:
                  handleGenericRsvpPreviewSubmit,
              }
            : undefined,

        photoWall:
          data.photoWall,
      }),
      [
        content,
        presentation,
        locale,
        data.type,
        data.eventTimezone,
        data.photoWall,
        features.rsvp,
        rsvpPreviewState,
        rsvpPreviewMode,
      ]
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <EventExperienceEditor
        activeStep={
          activeStep
        }
        features={
          features
        }
        saveStatus={
          saveStatus
        }
        onStepChange={
          handleStepChange
        }
        onPreview={
          handleOpenPreview
        }
        sidebar={
          <EventExperienceEditorSidebar
            activeStep={
              activeStep
            }
            content={
              content
            }
            rsvpPreviewState={
              rsvpPreviewState
            }
            onContentChange={
              setContent
            }
            onRsvpPreviewStateChange={
              setRsvpPreviewState
            }
          />
        }
        toolbar={
          <EventExperienceEditorToolbar
            selectedElement={
              selectedElement
            }
            presentation={
              presentation
            }
            onPresentationChange={
              setPresentation
            }
          />
        }
      >
        <EventExperienceRenderer
          templateId={
            templateId
          }
          variantId={
            variantId
          }
          mode="edit"
          data={
            editorRenderData
          }
          editorStep={
            activeStep
          }
          editor={{
            experienceId,

            selectedElement,
            editingElement,
            content,
            presentation,

            onSelectElement:
              setSelectedElement,

            onStartEdit:
              handleStartEdit,

            onEndEdit:
              handleEndEdit,

            onContentChange:
              setContent,

            onPresentationChange:
              setPresentation,
          }}
        />
      </EventExperienceEditor>

      {isPreviewOpen && (
        <EventExperienceEditorPreview
          templateId={
            templateId
          }
          variantId={
            variantId
          }
          data={
            previewRenderData
          }
          onClose={
            handleClosePreview
          }
        />
      )}
    </>
  );
}