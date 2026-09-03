import type {
  Database,
  Json,
  Tables,
} from "@/lib/supabase/database.types";

import type {
  InvitationRsvpResponse,
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
   Recipient RPC Inputs
========================================================================== */

export type CreateInvitationRecipientInput =
  Database["public"]["Functions"]["create_invitation_recipient"]["Args"];

export type DeleteInvitationRecipientInput =
  Database["public"]["Functions"]["delete_invitation_recipient"]["Args"];

export type GetInvitationRecipientsInput =
  Database["public"]["Functions"]["get_invitation_recipients"]["Args"];

export type GetPublicInvitationRecipientInput =
  Database["public"]["Functions"]["get_public_invitation_recipient"]["Args"];


/* ==========================================================================
   Recipient RSVP
========================================================================== */

export type InvitationRecipientRsvp =
  Pick<
    InvitationRsvpResponse,
    | "status"
    | "answers"
    | "responded_at"
    | "updated_at"
  >;


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
   Public Invitation Recipient RSVP
========================================================================== */

export type PublicInvitationRecipientRsvp =
  InvitationRecipientRsvp;


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
    PublicInvitationRecipientRsvp | null;
}


/* ==========================================================================
   Public Invitation Recipient Invitation
========================================================================== */

export interface PublicInvitationRecipientInvitation {
  public_id:
    string;

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