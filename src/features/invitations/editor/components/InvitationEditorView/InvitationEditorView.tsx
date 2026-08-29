"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  updateInvitationAction,
} from "@/features/invitations/actions/updateInvitationAction";

import InvitationEditor
  from "@/features/invitations/editor/components/InvitationEditor/InvitationEditor";

import InvitationEditorSidebar
  from "@/features/invitations/editor/components/InvitationEditorSidebar/InvitationEditorSidebar";

import InvitationEditorToolbar
  from "@/features/invitations/editor/components/InvitationEditorToolbar/InvitationEditorToolbar";

import {
  buildInvitationEditorContent,
} from "@/features/invitations/editor/data/buildInvitationEditorContent";

import type {
  InvitationEditorSaveStatus,
  InvitationEditorSelection,
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
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Constants
========================================================================== */

const AUTOSAVE_DELAY =
  700;


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
  locale,
  data,
}: InvitationEditorViewProps) {
  const tFallback =
    useTranslations(
      "Invitations.editor.fallback"
    );


  /* ==========================================================================
     State
  ========================================================================== */

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
    saveStatus,
    setSaveStatus,
  ] =
    useState<InvitationEditorSaveStatus>(
      "saved"
    );


  /* ==========================================================================
     Fallback Translations
  ========================================================================== */

  const fallbackTranslations =
    useMemo(
      () => ({
        heroTitle:
          tFallback(
            "heroTitle"
          ),

        heroSubtitle:
          tFallback(
            "heroSubtitle"
          ),

        description:
          tFallback(
            "description"
          ),

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

        rsvpCalloutSubtitle:
          tFallback(
            "rsvpCalloutSubtitle"
          ),

        rsvpCalloutNote:
          tFallback(
            "rsvpCalloutNote"
          ),
      }),
      [
        tFallback,
      ]
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const lastSavedContentRef =
    useRef<InvitationContent>(
      data.content
    );

  const lastSavedPresentationRef =
    useRef<InvitationPresentation>(
      data.presentation
    );

  const saveRevisionRef =
    useRef(
      0
    );


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
     Autosave
  ========================================================================== */

  useEffect(
    () => {
      const contentChanged =
        JSON.stringify(
          content
        ) !==
        JSON.stringify(
          lastSavedContentRef.current
        );

      const presentationChanged =
        JSON.stringify(
          presentation
        ) !==
        JSON.stringify(
          lastSavedPresentationRef.current
        );

      if (
        !contentChanged &&
        !presentationChanged
      ) {
        return;
      }

      const revision =
        ++saveRevisionRef.current;

      setSaveStatus(
        "saving"
      );

      const timeoutId =
        window.setTimeout(
          async () => {
            const result =
              await updateInvitationAction({
                p_invitation_id:
                  invitationId,

                p_name:
                  invitationName,

                p_template_id:
                  templateId,

                p_variant_id:
                  variantId,

                p_content:
                  content,

                p_presentation:
                  presentation,
              });

            if (
              revision !==
              saveRevisionRef.current
            ) {
              return;
            }

            if (
              !result.success
            ) {
              setSaveStatus(
                "error"
              );

              return;
            }

            lastSavedContentRef.current =
              content;

            lastSavedPresentationRef.current =
              presentation;

            setSaveStatus(
              "saved"
            );
          },
          AUTOSAVE_DELAY
        );

      return () => {
        window.clearTimeout(
          timeoutId
        );
      };
    },
    [
      content,
      presentation,
      invitationId,
      invitationName,
      templateId,
      variantId,
    ]
  );


  /* ==========================================================================
     Render Data
  ========================================================================== */

  const renderData =
    useMemo<InvitationRenderData>(
      () => {
        const editorContent =
          buildInvitationEditorContent(
            content,
            fallbackTranslations
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
        };
      },
      [
        content,
        presentation,
        locale,
        fallbackTranslations,
      ]
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <InvitationEditor
      saveStatus={
        saveStatus
      }
      sidebar={
        <InvitationEditorSidebar />
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
          renderData
        }
        editor={{
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
  );
}