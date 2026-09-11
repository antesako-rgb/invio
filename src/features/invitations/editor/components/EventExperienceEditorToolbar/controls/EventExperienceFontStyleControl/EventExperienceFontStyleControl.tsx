"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Italic,
} from "lucide-react";

import {
  useEventExperienceElementPresentation,
} from "@/features/invitations/editor/hooks/useEventExperienceElementPresentation";

import type {
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceFontStyleControlProps {
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
   Event Experience Font Style Control
========================================================================== */

export default function EventExperienceFontStyleControl({
  element,
  presentation,
  onPresentationChange,
}: EventExperienceFontStyleControlProps) {
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
    computedFontStyle,
    setComputedFontStyle,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Computed Font Style
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

      setComputedFontStyle(
        styles.fontStyle
      );
    },
    [
      element,
      elementPresentation?.font_style,
    ]
  );


  /* ==========================================================================
     Font Style
  ========================================================================== */

  const fontStyle =
    elementPresentation?.font_style ??
    computedFontStyle ??
    "normal";

  const isItalic =
    fontStyle ===
    "italic";


  /* ==========================================================================
     Toggle Italic
  ========================================================================== */

  function handleToggleItalic() {
    updatePresentation({
      font_style:
        isItalic
          ? "normal"
          : "italic",
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <button
      type="button"
      className={[
        "event-experience-editor-toolbar__icon",
        isItalic
          ? "event-experience-editor-toolbar__icon--active"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Italic"
      aria-pressed={
        isItalic
      }
      onClick={
        handleToggleItalic
      }
    >
      <Italic
        size={16}
        aria-hidden="true"
      />
    </button>
  );
}