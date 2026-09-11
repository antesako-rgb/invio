import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Event Experience Type
========================================================================== */

export type EventExperienceType =
  | "invitation"
  | "save-the-date"
  | "thank-you"
  | "photo-wall";


/* ==========================================================================
   Event Experience
========================================================================== */

export type EventExperience =
  Omit<
    Tables<"invitations">,
    "type"
  > & {
    type:
      EventExperienceType;
  };


/* ==========================================================================
   Create Event Experience Input
========================================================================== */

export interface CreateEventExperienceInput {
  eventId:
    string;

  name:
    string;

  type:
    EventExperienceType;

  templateId:
    string;

  variantId:
    string;

  content?:
    EventExperienceContent;

  presentation?:
    EventExperiencePresentation;
}


/* ==========================================================================
   Update Event Experience Input
========================================================================== */

export interface UpdateEventExperienceInput {
  experienceId:
    string;

  name:
    string;

  templateId:
    string;

  variantId:
    string;

  content:
    EventExperienceContent;

  presentation:
    EventExperiencePresentation;
}


/* ==========================================================================
   Publish Event Experience Input
========================================================================== */

export interface PublishEventExperienceInput {
  experienceId:
    string;
}


/* ==========================================================================
   Unpublish Event Experience Input
========================================================================== */

export interface UnpublishEventExperienceInput {
  experienceId:
    string;
}


/* ==========================================================================
   Delete Event Experience Input
========================================================================== */

export interface DeleteEventExperienceInput {
  experienceId:
    string;
}


/* ==========================================================================
   Public Event Experience Input
========================================================================== */

export interface GetPublicEventExperienceInput {
  publicId:
    string;
}


/* ==========================================================================
   Public Event Experience
========================================================================== */

export type PublicEventExperience =
  Omit<
    Database["public"]["Functions"]["get_public_invitation"]["Returns"][number],
    "type"
  > & {
    type:
      EventExperienceType;
  };


/* ==========================================================================
   Set Primary RSVP Invitation Input
========================================================================== */

export type SetPrimaryRsvpInvitationInput =
  Database["public"]["Functions"]["set_primary_rsvp_invitation"]["Args"];