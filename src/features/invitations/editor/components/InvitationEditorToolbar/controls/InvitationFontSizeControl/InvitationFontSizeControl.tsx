"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Minus,
  Plus,
} from "lucide-react";

import {
  useInvitationElementPresentation,
} from "@/features/invitations/editor/hooks/useInvitationElementPresentation";

import type {
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Constants
========================================================================== */

const FONT_SIZE_STEP =
  1;

const MIN_FONT_SCALE =
  0.5;

const MAX_FONT_SCALE =
  2;


/* ==========================================================================
   Types
========================================================================== */

interface InvitationFontSizeControlProps {
  element:
    InvitationEditorSelection;

  presentation:
    InvitationPresentation;

  onPresentationChange:
    (
      presentation: InvitationPresentation
    ) => void;
}


/* ==========================================================================
   Invitation Font Size Control
========================================================================== */

export default function InvitationFontSizeControl({
  element,
  presentation,
  onPresentationChange,
}: InvitationFontSizeControlProps) {
  /* ==========================================================================
     Presentation
  ========================================================================== */

  const {
    elementPresentation,
    updatePresentation,
  } =
    useInvitationElementPresentation({
      element,
      presentation,
      onPresentationChange,
    });

  const fontScale =
    elementPresentation?.font_scale ??
    1;


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    computedFontSize,
    setComputedFontSize,
  ] =
    useState<number | null>(
      null
    );


  /* ==========================================================================
     Computed Font Size
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

      const elementTarget =
        target;

      function updateComputedFontSize() {
        const styles =
          window.getComputedStyle(
            elementTarget
          );

        const value =
          Number.parseFloat(
            styles.fontSize
          );

        if (
          Number.isNaN(
            value
          )
        ) {
          return;
        }

        setComputedFontSize(
          value
        );
      }

      updateComputedFontSize();

      const observer =
        new ResizeObserver(
          updateComputedFontSize
        );

      observer.observe(
        elementTarget
      );

      return () => {
        observer.disconnect();
      };
    },
    [
      element,
      fontScale,
    ]
  );


  /* ==========================================================================
     Change Font Size
  ========================================================================== */

  function changeFontSize(
    direction:
      -1 | 1
  ) {
    if (
      computedFontSize === null
    ) {
      return;
    }

    const baseFontSize =
      computedFontSize /
      fontScale;

    const targetFontSize =
      computedFontSize +
      (
        FONT_SIZE_STEP *
        direction
      );

    const nextScale =
      Math.min(
        MAX_FONT_SCALE,
        Math.max(
          MIN_FONT_SCALE,
          targetFontSize /
            baseFontSize
        )
      );

    updatePresentation({
      font_scale:
        Number(
          nextScale.toFixed(4)
        ),
    });
  }


  /* ==========================================================================
     Decrease
  ========================================================================== */

  function handleDecrease() {
    changeFontSize(
      -1
    );
  }


  /* ==========================================================================
     Increase
  ========================================================================== */

  function handleIncrease() {
    changeFontSize(
      1
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-editor-toolbar__group"
    >
      <button
        type="button"
        className="invitation-editor-toolbar__icon"
        aria-label="Decrease font size"
        disabled={
          fontScale <=
          MIN_FONT_SCALE
        }
        onClick={
          handleDecrease
        }
      >
        <Minus
          size={16}
          aria-hidden="true"
        />
      </button>

      <span
        className="invitation-editor-toolbar__value"
      >
        {computedFontSize !== null
          ? Math.round(
              computedFontSize
            )
          : "—"}
      </span>

      <button
        type="button"
        className="invitation-editor-toolbar__icon"
        aria-label="Increase font size"
        disabled={
          fontScale >=
          MAX_FONT_SCALE
        }
        onClick={
          handleIncrease
        }
      >
        <Plus
          size={16}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}