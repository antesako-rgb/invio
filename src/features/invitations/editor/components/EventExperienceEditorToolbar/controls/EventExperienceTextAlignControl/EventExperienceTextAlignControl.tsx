"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";

import {
  useEventExperienceElementPresentation,
} from "@/features/invitations/editor/hooks/useEventExperienceElementPresentation";

import type {
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperiencePresentation,
  EventExperienceTextAlign,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceTextAlignControlProps {
  element:
    EventExperienceEditorSelection;

  presentation:
    EventExperiencePresentation;

  onPresentationChange:
    (
      presentation: EventExperiencePresentation
    ) => void;
}


/* ==========================================================================
   Event Experience Text Align Control
========================================================================== */

export default function EventExperienceTextAlignControl({
  element,
  presentation,
  onPresentationChange,
}: EventExperienceTextAlignControlProps) {
  /* ==========================================================================
     Presentation
  ========================================================================== */

  const {
    elementPresentation,
    updatePresentation,
  } =
    useEventExperienceElementPresentation({
      element,
      presentation,
      onPresentationChange,
    });


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    computedTextAlign,
    setComputedTextAlign,
  ] =
    useState<EventExperienceTextAlign | null>(
      null
    );


  /* ==========================================================================
     Computed Text Align
  ========================================================================== */

  useEffect(
    () => {
      const target =
        document.querySelector<HTMLElement>(
          `[data-editor-element="${element}"]`
        );

      if (!target) {
        return;
      }

      const styles =
        window.getComputedStyle(
          target
        );

      const textAlign =
        styles.textAlign;

      if (
        textAlign === "left" ||
        textAlign === "center" ||
        textAlign === "right"
      ) {
        setComputedTextAlign(
          textAlign
        );
      }
    },
    [
      element,
      elementPresentation?.text_align,
    ]
  );


  /* ==========================================================================
     Text Align
  ========================================================================== */

  const textAlign =
    elementPresentation?.text_align ??
    computedTextAlign ??
    "center";


  /* ==========================================================================
     Change Text Align
  ========================================================================== */

  function handleTextAlign(
    value:
      EventExperienceTextAlign
  ) {
    updatePresentation({
      text_align:
        value,
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="event-experience-editor-toolbar__group"
    >
      <button
        type="button"
        className={[
          "event-experience-editor-toolbar__icon",
          textAlign === "left"
            ? "event-experience-editor-toolbar__icon--active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Align left"
        aria-pressed={
          textAlign === "left"
        }
        onClick={
          () =>
            handleTextAlign(
              "left"
            )
        }
      >
        <AlignLeft
          size={16}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        className={[
          "event-experience-editor-toolbar__icon",
          textAlign === "center"
            ? "event-experience-editor-toolbar__icon--active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Align center"
        aria-pressed={
          textAlign === "center"
        }
        onClick={
          () =>
            handleTextAlign(
              "center"
            )
        }
      >
        <AlignCenter
          size={16}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        className={[
          "event-experience-editor-toolbar__icon",
          textAlign === "right"
            ? "event-experience-editor-toolbar__icon--active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Align right"
        aria-pressed={
          textAlign === "right"
        }
        onClick={
          () =>
            handleTextAlign(
              "right"
            )
        }
      >
        <AlignRight
          size={16}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}