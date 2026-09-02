import type {
  InvitationEditorElementName,
} from "@/features/invitations/editor/registry/invitationEditorElements";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Invitation Editor Selection
========================================================================== */

export type InvitationEditorSelection =
  InvitationEditorElementName;


/* ==========================================================================
   Invitation Editor Step
========================================================================== */

export type InvitationEditorStep =
  | "design"
  | "details"
  | "rsvp";


/* ==========================================================================
   Invitation Editor Save Status
========================================================================== */

export type InvitationEditorSaveStatus =
  | "saving"
  | "saved"
  | "error";


/* ==========================================================================
   Invitation Editor Context
========================================================================== */

export interface InvitationEditorContext {
  invitationId:
    string;

  selectedElement:
    InvitationEditorSelection | null;

  editingElement:
    InvitationEditorSelection | null;

  content:
    InvitationContent;

  presentation:
    InvitationPresentation;

  onSelectElement:
    (
      element:
        InvitationEditorSelection
    ) => void;

  onStartEdit:
    (
      element:
        InvitationEditorSelection
    ) => void;

  onEndEdit:
    () => void;

  onContentChange:
    (
      content:
        InvitationContent
    ) => void;

  onPresentationChange:
    (
      presentation:
        InvitationPresentation
    ) => void;
}