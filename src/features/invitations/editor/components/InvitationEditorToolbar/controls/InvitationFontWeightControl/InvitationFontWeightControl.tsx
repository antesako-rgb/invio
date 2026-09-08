"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bold,
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

const DEFAULT_FONT_WEIGHT =
  400;

const BOLD_FONT_WEIGHT =
  600;


/* ==========================================================================
   Types
========================================================================== */

interface InvitationFontWeightControlProps {
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
   Invitation Font Weight Control
========================================================================== */

export default function InvitationFontWeightControl({
  element,
  presentation,
  onPresentationChange,
}: InvitationFontWeightControlProps) {
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
        "invitation-editor-toolbar__icon",
        isBold
          ? "invitation-editor-toolbar__icon--active"
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