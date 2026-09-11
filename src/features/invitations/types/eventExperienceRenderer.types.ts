import type {
  EventExperienceEditorContext,
  EventExperienceEditorStep,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import type {
  InvitationRecipientRsvp,
} from "@/features/invitations/types/invitationRecipient.types";

import type {
  GenericInvitationRsvpGuest,
  InvitationRsvpSubmission,
  InvitationRSVPPreviewMode,
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Event Experience Render Mode
========================================================================== */

export type EventExperienceRenderMode =
  | "live"
  | "preview"
  | "edit"
  | "print";


/* ==========================================================================
   Event Experience Date Display
========================================================================== */

export interface EventExperienceDateDisplay {
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

  hasEndDate:
    boolean;

  endValue:
    string | null;

  endDay:
    string;

  endDayName:
    string;

  endMonth:
    string;

  endYear:
    string;
}


/* ==========================================================================
   Event Experience Time Display
========================================================================== */

export interface EventExperienceTimeDisplay {
  hasTime:
    boolean;

  text:
    string;
}


/* ==========================================================================
   Event Experience Location Display
========================================================================== */

export interface EventExperienceLocationDisplay {
  hasLocation:
    boolean;

  venueName:
    string;

  address:
    string;
}


/* ==========================================================================
   Event Experience Display Data
========================================================================== */

export interface EventExperienceDisplayData {
  date:
    EventExperienceDateDisplay;

  time:
    EventExperienceTimeDisplay;

  location:
    EventExperienceLocationDisplay;
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

  rsvp:
    InvitationRecipientRsvp | null;
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
   Generic Invitation RSVP Submit Handler
========================================================================== */

export type GenericInvitationRsvpSubmitHandler =
  (
    guests:
      GenericInvitationRsvpGuest[]
  ) => void | Promise<void>;


/* ==========================================================================
   Invitation Render Capability
========================================================================== */

export interface InvitationRenderCapability {
  guests:
    InvitationRenderGuest[];

  rsvpPreviewState?:
    InvitationRSVPViewState;

  rsvpPreviewMode?:
    InvitationRSVPPreviewMode;

  onRsvpPreviewStateChange?:
    (
      state:
        InvitationRSVPViewState
    ) => void;

  onRsvpPreviewModeChange?:
    (
      mode:
        InvitationRSVPPreviewMode
    ) => void;

  onSubmitRsvp?:
    InvitationRsvpSubmitHandler;

  onSubmitGenericRsvp?:
    GenericInvitationRsvpSubmitHandler;
}


/* ==========================================================================
   Photo Wall Render Photo
========================================================================== */

export interface PhotoWallRenderPhoto {
  id:
    string;

  image_path:
    string;

  file_size:
    number;

  description:
    string | null;

  created_at:
    string;
}


/* ==========================================================================
   Photo Wall Render Capability
========================================================================== */

export interface PhotoWallRenderCapability {
  photos:
    PhotoWallRenderPhoto[];
}


/* ==========================================================================
   Event Experience Render Data
========================================================================== */

export interface EventExperienceRenderData {
  type:
    EventExperienceType;

  publicId?:
    string;

  content:
    EventExperienceContent;

  presentation:
    EventExperiencePresentation;

  display:
    EventExperienceDisplayData;

  eventTimezone:
    string;

  invitation?:
    InvitationRenderCapability;

  photoWall?:
    PhotoWallRenderCapability;
}


/* ==========================================================================
   Event Experience Renderer Props
========================================================================== */

export interface EventExperienceRendererProps {
  templateId:
    string;

  variantId:
    string;

  mode:
    EventExperienceRenderMode;

  data:
    EventExperienceRenderData;

  editor?:
    EventExperienceEditorContext;

  editorStep?:
    EventExperienceEditorStep;
}