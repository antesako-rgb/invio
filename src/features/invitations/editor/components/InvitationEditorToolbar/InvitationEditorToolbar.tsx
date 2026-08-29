"use client";

import InvitationFontFamilyControl
  from "@/features/invitations/editor/components/InvitationEditorToolbar/controls/InvitationFontFamilyControl/InvitationFontFamilyControl";

import InvitationFontSizeControl
  from "@/features/invitations/editor/components/InvitationEditorToolbar/controls/InvitationFontSizeControl/InvitationFontSizeControl";

import InvitationFontWeightControl
  from "@/features/invitations/editor/components/InvitationEditorToolbar/controls/InvitationFontWeightControl/InvitationFontWeightControl";

import InvitationFontStyleControl
  from "@/features/invitations/editor/components/InvitationEditorToolbar/controls/InvitationFontStyleControl/InvitationFontStyleControl";

import InvitationTextColorControl
  from "@/features/invitations/editor/components/InvitationEditorToolbar/controls/InvitationTextColorControl/InvitationTextColorControl";

import InvitationTextAlignControl
  from "@/features/invitations/editor/components/InvitationEditorToolbar/controls/InvitationTextAlignControl/InvitationTextAlignControl";

import type {
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";

import "./InvitationEditorToolbar.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorToolbarProps {
  selectedElement:
    InvitationEditorSelection | null;

  presentation:
    InvitationPresentation;

  onPresentationChange:
    (
      presentation: InvitationPresentation
    ) => void;
}


/* ==========================================================================
   Invitation Editor Toolbar
========================================================================== */

export default function InvitationEditorToolbar({
  selectedElement,
  presentation,
  onPresentationChange,
}: InvitationEditorToolbarProps) {
  if (!selectedElement) {
    return null;
  }

  const currentElement =
    selectedElement;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-editor-toolbar"
      data-invitation-editor-toolbar
      role="toolbar"
    >
      {/* ====================================================================
          Text Color
      ==================================================================== */}

      <InvitationTextColorControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Font Family
      ==================================================================== */}

      <InvitationFontFamilyControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Font Size
      ==================================================================== */}

      <InvitationFontSizeControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Separator
      ==================================================================== */}

      <div
        className="invitation-editor-toolbar__separator"
        aria-hidden="true"
      />


      {/* ====================================================================
          Font Weight
      ==================================================================== */}

      <InvitationFontWeightControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Font Style
      ==================================================================== */}

      <InvitationFontStyleControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />


      {/* ====================================================================
          Separator
      ==================================================================== */}

      <div
        className="invitation-editor-toolbar__separator"
        aria-hidden="true"
      />


      {/* ====================================================================
          Text Align
      ==================================================================== */}

      <InvitationTextAlignControl
        element={
          currentElement
        }
        presentation={
          presentation
        }
        onPresentationChange={
          onPresentationChange
        }
      />
    </div>
  );
}