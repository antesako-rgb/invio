"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bold,
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
   Constants
========================================================================== */

const DEFAULT_FONT_WEIGHT =
  400;

const BOLD_FONT_WEIGHT =
  600;


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceFontWeightControlProps {
  element:
    EventExperienceEditorSelection;

  presentation:
    EventExperiencePresentation;

  onPresentationChange:
    (
      presentation:
        EventExperiencePresentation
    ) => void;
}


/* ==========================================================================
   Event Experience Font Weight Control
========================================================================== */

export default function EventExperienceFontWeightControl({
  element,
  presentation,
  onPresentationChange,
}: EventExperienceFontWeightControlProps) {
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
    computedFontWeight,
    setComputedFontWeight,
  ] =
    useState<number | null>(
      null
    );


  /* ==========================================================================
     Computed Font Weight
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

      const fontWeight =
        Number(
          styles.fontWeight
        );

      if (
        Number.isFinite(
          fontWeight
        )
      ) {
        setComputedFontWeight(
          fontWeight
        );
      }
    },
    [
      element,
      elementPresentation?.font_weight,
    ]
  );


  /* ==========================================================================
     Font Weight
  ========================================================================== */

  const fontWeight =
    elementPresentation?.font_weight ??
    computedFontWeight ??
    DEFAULT_FONT_WEIGHT;

  const isBold =
    fontWeight >=
    BOLD_FONT_WEIGHT;


  /* ==========================================================================
     Toggle Bold
  ========================================================================== */

  function handleToggleBold() {
    updatePresentation({
      font_weight:
        isBold
          ? DEFAULT_FONT_WEIGHT
          : BOLD_FONT_WEIGHT,
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
        isBold
          ? "event-experience-editor-toolbar__icon--active"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Bold"
      aria-pressed={
        isBold
      }
      onClick={
        handleToggleBold
      }
    >
      <Bold
        size={16}
        aria-hidden="true"
      />
    </button>
  );
}