import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  InvitationRsvpStatus,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Invitation Management Guest RSVP
========================================================================== */

export interface InvitationManagementGuestRsvp {
  status:
    InvitationRsvpStatus;

  answers:
    Json;

  responded_at:
    string;

  updated_at:
    string;
}


/* ==========================================================================
   Invitation Management Guest
========================================================================== */

export interface InvitationManagementGuest {
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

  recipient_id:
    string | null;

  recipient_public_id:
    string | null;

  is_primary_recipient:
    boolean;

  assigned_at:
    string;

  rsvp:
    InvitationManagementGuestRsvp | null;
}


/* ==========================================================================
   Invitation Management Row Guest
========================================================================== */

export interface InvitationManagementRowGuest {
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
    InvitationManagementGuestRsvp | null;
}


/* ==========================================================================
   Invitation Management Row
========================================================================== */

export interface InvitationManagementRow {
  id:
    string;

  recipient_id:
    string | null;

  public_id:
    string | null;

  guests:
    InvitationManagementRowGuest[];

  created_at:
    string;

  updated_at:
    string;
}


/* ==========================================================================
   Get Invitation Management Guests Input
========================================================================== */

export interface GetInvitationManagementGuestsInput {
  invitationId:
    string;
}