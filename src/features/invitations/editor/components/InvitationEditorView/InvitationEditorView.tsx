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
  getInvitationTemplateConfig,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry.utils";

import InvitationEditor
  from "@/features/invitations/editor/components/InvitationEditor/InvitationEditor";

import InvitationEditorPreview
  from "@/features/invitations/editor/components/InvitationEditorPreview/InvitationEditorPreview";

import InvitationEditorSidebar
  from "@/features/invitations/editor/components/InvitationEditorSidebar/InvitationEditorSidebar";

import InvitationEditorToolbar
  from "@/features/invitations/editor/components/InvitationEditorToolbar/InvitationEditorToolbar";

import {
  buildInvitationEditorContent,
} from "@/features/invitations/editor/data/buildInvitationEditorContent";

import {
  getInvitationEditorFallback,
} from "@/features/invitations/editor/data/InvitationEditorFallbacks";

import {
  INVITATION_EDITOR_PREVIEW_GUESTS,
} from "@/features/invitations/editor/data/InvitationEditorPreviewGuests";

import type {
  InvitationEditorEventTranslations,
  InvitationEditorFallbackTranslations,
} from "@/features/invitations/editor/data/InvitationEditorFallback.types";

import {
  useInvitationAutosave,
} from "@/features/invitations/editor/hooks/useInvitationAutosave";

import type {
  InvitationEditorSelection,
  InvitationEditorStep,
} from "@/features/invitations/editor/types/invitationEditor.types";

import {
  buildInvitationDateDisplay,
} from "@/features/invitations/renderer/buildInvitationDateDisplay";

import {
  buildInvitationLocationDisplay,
} from "@/features/invitations/renderer/buildInvitationLocationDisplay";

import {
  buildInvitationTimeDisplay,
} from "@/features/invitations/renderer/buildInvitationTimeDisplay";

import InvitationRenderer
  from "@/features/invitations/renderer/InvitationRenderer";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";

import type {
  InvitationRenderData,
  GenericInvitationRsvpSubmitHandler,
  InvitationRsvpSubmitHandler,
} from "@/features/invitations/types/invitationRenderer.types";

import type {
  InvitationRSVPPreviewMode,
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorViewProps {
  invitationId:
    string;

  invitationName:
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
    InvitationRenderData;
}


/* ==========================================================================
   Invitation Editor View
========================================================================== */

export default function InvitationEditorView({
  invitationId,
  invitationName,
  templateId,
  variantId,
  eventType,
  locale,
  data,
}: InvitationEditorViewProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const tFallback =
    useTranslations(
      "Invitations.editor.fallback"
    );

  const tEventContent =
    useTranslations(
      "InvitationContent"
    );


  /* ==========================================================================
     Template
  ========================================================================== */

  const template =
    getInvitationTemplateConfig(
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
    useState<InvitationEditorStep>(
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
      InvitationEditorSelection | null
    >(
      null
    );

  const [
    editingElement,
    setEditingElement,
  ] =
    useState<
      InvitationEditorSelection | null
    >(
      null
    );

  const [
    content,
    setContent,
  ] =
    useState<InvitationContent>(
      data.content
    );

  const [
    presentation,
    setPresentation,
  ] =
    useState<InvitationPresentation>(
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
    useMemo<
      InvitationEditorFallbackTranslations
    >(
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
          tFallback(
            "rsvpTitle"
          ),

        rsvpDescription:
          tFallback(
            "rsvpDescription"
          ),
      }),
      [
        tFallback,
      ]
    );


  /* ==========================================================================
     Event Translations
  ========================================================================== */

  const eventTranslations =
    useMemo<
      InvitationEditorEventTranslations
    >(
      () => {
        const contentPath =
          eventType === "wedding"
            ? `${eventType}.${template.type}`
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
        template.type,
        tEventContent,
      ]
    );


  /* ==========================================================================
     Event Fallback
  ========================================================================== */

  const eventFallback =
    useMemo(
      () =>
        getInvitationEditorFallback(
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
    useInvitationAutosave({
      invitationId,
      invitationName,
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
      InvitationEditorStep
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
      InvitationEditorSelection
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
        rsvpPreviewMode !== "generic"
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
            "[data-invitation-editor-toolbar]"
          )
        ) {
          return;
        }

        if (
          target.closest(
            "[data-invitation-editor-ui]"
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
    useMemo<InvitationRenderData>(
      () => {
        const editorContent =
          buildInvitationEditorContent(
            content,
            fallbackTranslations,
            eventTranslations,
            eventFallback
          );

        return {
          content:
            editorContent,

          presentation,

          display: {
            date:
              buildInvitationDateDisplay(
                editorContent.date,
                locale
              ),

            time:
              buildInvitationTimeDisplay(
                editorContent.time
              ),

            location:
              buildInvitationLocationDisplay(
                editorContent.location
              ),
          },

          guests:
            INVITATION_EDITOR_PREVIEW_GUESTS,

          eventTimezone:
            data.eventTimezone,
        };
      },
      [
        content,
        presentation,
        locale,
        fallbackTranslations,
        eventTranslations,
        eventFallback,
        data.eventTimezone,
      ]
    );


  /* ==========================================================================
     Preview Render Data
  ========================================================================== */

  const previewRenderData =
    useMemo<InvitationRenderData>(
      () => ({
        content,

        presentation,

        display: {
          date:
            buildInvitationDateDisplay(
              content.date,
              locale
            ),

          time:
            buildInvitationTimeDisplay(
              content.time
            ),

          location:
            buildInvitationLocationDisplay(
              content.location
            ),
        },

        guests:
          INVITATION_EDITOR_PREVIEW_GUESTS,

        eventTimezone:
          data.eventTimezone,
      }),
      [
        content,
        presentation,
        locale,
        data.eventTimezone,
      ]
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <InvitationEditor
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
          <InvitationEditorSidebar
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
          <InvitationEditorToolbar
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
        <InvitationRenderer
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
          rsvpPreviewState={
            rsvpPreviewState
          }
          rsvpPreviewMode={
            rsvpPreviewMode
          }
          onRsvpPreviewModeChange={
            setRsvpPreviewMode
          }
          onRsvpSubmit={
            handleRsvpPreviewSubmit
          }
          onGenericRsvpSubmit={
            handleGenericRsvpPreviewSubmit
          }
          editor={{
            invitationId,

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
      </InvitationEditor>

      {isPreviewOpen && (
        <InvitationEditorPreview
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