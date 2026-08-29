"use client";

import {
  Italic,
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

const DEFAULT_FONT_STYLE =
  "normal";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationFontStyleControlProps {
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
   Invitation Font Style Control
========================================================================== */

export default function InvitationFontStyleControl({
  element,
  presentation,
  onPresentationChange,
}: InvitationFontStyleControlProps) {
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
     Font Style
  ========================================================================== */

  const fontStyle =
    elementPresentation?.font_style ??
    DEFAULT_FONT_STYLE;

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
        "invitation-editor-toolbar__icon",
        isItalic
          ? "invitation-editor-toolbar__icon--active"
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