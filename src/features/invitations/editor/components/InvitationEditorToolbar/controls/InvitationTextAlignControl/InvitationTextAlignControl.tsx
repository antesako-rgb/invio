"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";

import {
  useInvitationElementPresentation,
} from "@/features/invitations/editor/hooks/useInvitationElementPresentation";

import type {
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationPresentation,
  InvitationTextAlign,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_TEXT_ALIGN:
  InvitationTextAlign =
    "center";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationTextAlignControlProps {
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
   Invitation Text Align Control
========================================================================== */

export default function InvitationTextAlignControl({
  element,
  presentation,
  onPresentationChange,
}: InvitationTextAlignControlProps) {
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
     Text Align
  ========================================================================== */

  const textAlign =
    elementPresentation?.text_align ??
    DEFAULT_TEXT_ALIGN;


  /* ==========================================================================
     Change Text Align
  ========================================================================== */

  function handleTextAlign(
    value:
      InvitationTextAlign
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
      className="invitation-editor-toolbar__group"
    >
      <button
        type="button"
        className={[
          "invitation-editor-toolbar__icon",
          textAlign === "left"
            ? "invitation-editor-toolbar__icon--active"
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
          "invitation-editor-toolbar__icon",
          textAlign === "center"
            ? "invitation-editor-toolbar__icon--active"
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
          "invitation-editor-toolbar__icon",
          textAlign === "right"
            ? "invitation-editor-toolbar__icon--active"
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