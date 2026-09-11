import type {
  Json,
  Tables,
} from "@/lib/supabase/database.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import type {
  InvitationRsvpResponse,
  InvitationRsvpStatus,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Invitation Recipient
========================================================================== */

export type InvitationRecipient =
  Tables<"invitation_recipients">;


/* ==========================================================================
   Invitation Guest
========================================================================== */

export type InvitationGuest =
  Tables<"invitation_guests">;


/* ==========================================================================
   Invitation Recipient Inputs
========================================================================== */

export interface CreateInvitationRecipientInput {
  invitationId:
    string;

  guestIds:
    string[];

  primaryGuestId:
    string;
}

export interface DeleteInvitationRecipientInput {
  recipientId:
    string;
}

export interface GetInvitationRecipientsInput {
  invitationId:
    string;
}

export interface GetPublicInvitationRecipientInput {
  publicId:
    string;
}


/* ==========================================================================
   Recipient RSVP
========================================================================== */

export type InvitationRecipientRsvp =
  Omit<
    Pick<
      InvitationRsvpResponse,
      | "status"
      | "answers"
      | "responded_at"
      | "updated_at"
    >,
    "status"
  > & {
    status:
      InvitationRsvpStatus;
  };


/* ==========================================================================
   Invitation Recipient RSVP Filter
========================================================================== */

export type InvitationRecipientRsvpFilter =
  | "all"
  | "pending"
  | "attending"
  | "declined";


/* ==========================================================================
   Invitation Recipient Guest
========================================================================== */

export interface InvitationRecipientGuest {
  id:
    string;

  first_name:
    string;

  last_name:
    string | null;

  email:
    string | null;

  phone:
    string | null;

  is_primary_recipient:
    boolean;

  rsvp:
    InvitationRecipientRsvp | null;
}


/* ==========================================================================
   Invitation Recipient Details
========================================================================== */

export interface InvitationRecipientDetails {
  id:
    string;

  public_id:
    string;

  created_at:
    string;

  updated_at:
    string;

  guests:
    InvitationRecipientGuest[];
}


/* ==========================================================================
   Public Invitation Recipient Guest
========================================================================== */

export interface PublicInvitationRecipientGuest {
  id:
    string;

  first_name:
    string;

  last_name:
    string | null;

  is_primary_recipient:
    boolean;

  rsvp:
    InvitationRecipientRsvp | null;
}


/* ==========================================================================
   Public Invitation Recipient Invitation
========================================================================== */

export interface PublicInvitationRecipientInvitation {
  public_id:
    string;

  type:
    EventExperienceType;

  template_id:
    string;

  variant_id:
    string;

  content:
    Json;

  presentation:
    Json;

  published_at:
    string | null;
}


/* ==========================================================================
   Public Invitation Recipient Event
========================================================================== */

export interface PublicInvitationRecipientEvent {
  timezone:
    string;
}


/* ==========================================================================
   Public Invitation Recipient
========================================================================== */

export interface PublicInvitationRecipient {
  public_id:
    string;

  invitation:
    PublicInvitationRecipientInvitation;

  event:
    PublicInvitationRecipientEvent;

  guests:
    PublicInvitationRecipientGuest[];
}