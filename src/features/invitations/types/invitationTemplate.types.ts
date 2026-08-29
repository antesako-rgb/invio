import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationRenderData,
  InvitationRenderMode,
} from "./invitationRenderer.types";


/* ==========================================================================
   Invitation Template Props
========================================================================== */

export interface InvitationTemplateProps {
  data:
    InvitationRenderData;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;
}


/* ==========================================================================
   Invitation Template Component
========================================================================== */

export type InvitationTemplateComponent =
  React.ComponentType<
    InvitationTemplateProps
  >;