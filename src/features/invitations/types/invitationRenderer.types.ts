import type {
  InvitationEditorContext,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationContent,
} from "./invitationContent.types";

import type {
  InvitationPresentation,
} from "./invitationPresentation.types";


/* ==========================================================================
   Invitation Render Mode
========================================================================== */

export type InvitationRenderMode =
  | "live"
  | "preview"
  | "edit"
  | "print";


/* ==========================================================================
   Invitation Date Display
========================================================================== */

export interface InvitationDateDisplay {
  hasDate:
    boolean;

  value:
    string | null;

  formatted:
    string;

  day:
    string;

  dayName:
    string;

  month:
    string;

  year:
    string;
}


/* ==========================================================================
   Invitation Time Display
========================================================================== */

export interface InvitationTimeDisplay {
  hasTime:
    boolean;

  text:
    string;
}


/* ==========================================================================
   Invitation Location Display
========================================================================== */

export interface InvitationLocationDisplay {
  hasLocation:
    boolean;

  venueName:
    string;

  address:
    string;
}


/* ==========================================================================
   Invitation Display Data
========================================================================== */

export interface InvitationDisplayData {
  date:
    InvitationDateDisplay;

  time:
    InvitationTimeDisplay;

  location:
    InvitationLocationDisplay;
}


/* ==========================================================================
   Invitation Render Data
========================================================================== */

export interface InvitationRenderData {
  content:
    InvitationContent;

  presentation:
    InvitationPresentation;

  display:
    InvitationDisplayData;
}


/* ==========================================================================
   Invitation Renderer Props
========================================================================== */

export interface InvitationRendererProps {
  templateId:
    string;

  variantId:
    string;

  mode:
    InvitationRenderMode;

  data:
    InvitationRenderData;

  editor?:
    InvitationEditorContext;
}