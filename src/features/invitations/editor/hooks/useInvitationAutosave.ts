"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  updateInvitationAction,
} from "@/features/invitations/actions/invitation/updateInvitationAction";

import type {
  InvitationEditorSaveStatus,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Constants
========================================================================== */

const AUTOSAVE_DELAY =
  700;


/* ==========================================================================
   Types
========================================================================== */

interface UseInvitationAutosaveInput {
  invitationId:
    string;

  invitationName:
    string;

  templateId:
    string;

  variantId:
    string;

  content:
    InvitationContent;

  presentation:
    InvitationPresentation;
}


/* ==========================================================================
   Use Invitation Autosave
========================================================================== */

export function useInvitationAutosave({
  invitationId,
  invitationName,
  templateId,
  variantId,
  content,
  presentation,
}: UseInvitationAutosaveInput) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    saveStatus,
    setSaveStatus,
  ] =
    useState<InvitationEditorSaveStatus>(
      "saved"
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const lastSavedContentRef =
    useRef<InvitationContent>(
      content
    );

  const lastSavedPresentationRef =
    useRef<InvitationPresentation>(
      presentation
    );

  const saveRevisionRef =
    useRef(
      0
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
     Return
  ========================================================================== */

  return saveStatus;
}