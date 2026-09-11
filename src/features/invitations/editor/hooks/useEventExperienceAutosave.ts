"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  updateEventExperienceAction,
} from "@/features/invitations/actions/experience/updateEventExperienceAction";

import type {
  EventExperienceEditorSaveStatus,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Constants
========================================================================== */

const AUTOSAVE_DELAY =
  700;


/* ==========================================================================
   Types
========================================================================== */

interface UseEventExperienceAutosaveInput {
  experienceId:
    string;

  experienceName:
    string;

  templateId:
    string;

  variantId:
    string;

  content:
    EventExperienceContent;

  presentation:
    EventExperiencePresentation;
}


/* ==========================================================================
   Use Event Experience Autosave
========================================================================== */

export function useEventExperienceAutosave({
  experienceId,
  experienceName,
  templateId,
  variantId,
  content,
  presentation,
}: UseEventExperienceAutosaveInput) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    saveStatus,
    setSaveStatus,
  ] =
    useState<EventExperienceEditorSaveStatus>(
      "saved"
    );


  /* ==========================================================================
     Refs
  ========================================================================== */

  const lastSavedContentRef =
    useRef<EventExperienceContent>(
      content
    );

  const lastSavedPresentationRef =
    useRef<EventExperiencePresentation>(
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
              await updateEventExperienceAction({
                experienceId,

                name:
                  experienceName,

                templateId,

                variantId,

                content,

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
      experienceId,
      experienceName,
      templateId,
      variantId,
    ]
  );


  /* ==========================================================================
     Return
  ========================================================================== */

  return saveStatus;
}