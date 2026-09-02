import type {
  InvitationEditorContext,
  InvitationEditorStep,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";

import type {
  InvitationRsvpSubmission,
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";


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
   Invitation Render Guest
========================================================================== */

export interface InvitationRenderGuest {
  id:
    string;

  firstName:
    string;

  lastName:
    string | null;

  isPrimaryRecipient:
    boolean;
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

  guests:
    InvitationRenderGuest[];
}


/* ==========================================================================
   Invitation RSVP Submit Handler
========================================================================== */

export type InvitationRsvpSubmitHandler =
  (
    submissions:
      InvitationRsvpSubmission[]
  ) => void | Promise<void>;


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

  editorStep?:
    InvitationEditorStep;

  rsvpPreviewState?:
    InvitationRSVPViewState;

  onRsvpSubmit?:
    InvitationRsvpSubmitHandler;
}