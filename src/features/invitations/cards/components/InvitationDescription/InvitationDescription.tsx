import EditableText
  from "@/features/invitations/editor/components/EditableText/EditableText";

import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import "./InvitationDescription.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationDescriptionProps {
  value:
    string | null;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;
}


/* ==========================================================================
   Invitation Description
========================================================================== */

export default function InvitationDescription({
  value,
  mode,
  editor,
}: InvitationDescriptionProps) {
  if (!value) {
    return null;
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditableText
      element="description"
      mode={
        mode
      }
      editor={
        editor
      }
      className="invitation-description"
    >
      {value}
    </EditableText>
  );
}