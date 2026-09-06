import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Invitation RSVP Response
========================================================================== */

export type InvitationRsvpResponse =
  Tables<"invitation_rsvp_responses">;


/* ==========================================================================
   Invitation RSVP Status
========================================================================== */

export type InvitationRsvpStatus =
  InvitationRsvpResponse["status"];


/* ==========================================================================
   Invitation RSVP Display Status
========================================================================== */

export type InvitationRsvpDisplayStatus =
  | InvitationRsvpStatus
  | "pending";


/* ==========================================================================
   Invitation RSVP View State
========================================================================== */

export type InvitationRSVPViewState =
  | "form"
  | "success";


/* ==========================================================================
   Invitation RSVP Preview Mode
========================================================================== */

export type InvitationRSVPPreviewMode =
  | "personalized"
  | "generic";


/* ==========================================================================
   Invitation RSVP Answer Value
========================================================================== */

export type InvitationRsvpAnswerValue =
  string
  | boolean
  | null;

/* ==========================================================================
   Invitation RSVP Answers
========================================================================== */

export type InvitationRsvpAnswers =
  Record<
    string,
    InvitationRsvpAnswerValue
  >;


/* ==========================================================================
   Invitation RSVP Submission
========================================================================== */

export interface InvitationRsvpSubmission {
  guest_id:
    string;

  status:
    InvitationRsvpStatus;

  answers:
    InvitationRsvpAnswers;
}


/* ==========================================================================
   Submit Invitation RSVP Input
========================================================================== */

export type SubmitInvitationRsvpInput =
  Database["public"]["Functions"]["submit_invitation_rsvp"]["Args"];


/* ==========================================================================
   Submit Invitation RSVP Data
========================================================================== */

export interface SubmitInvitationRsvpData {
  p_recipient_public_id:
    string;

  p_responses:
    InvitationRsvpSubmission[];
}


/* ==========================================================================
   Generic Invitation RSVP Guest
========================================================================== */

export interface GenericInvitationRsvpGuest {
  first_name: string;
  last_name: string | null;
  email: string | null;
  answers: InvitationRsvpAnswers;
}

/* ==========================================================================
   Submit Generic Invitation RSVP Input
========================================================================== */

export type SubmitGenericInvitationRsvpInput =
  Database["public"]["Functions"]["submit_generic_invitation_rsvp"]["Args"];


/* ==========================================================================
   Submit Generic Invitation RSVP Data
========================================================================== */

export interface SubmitGenericInvitationRsvpData {
  p_invitation_public_id:
    string;

  p_guests:
    GenericInvitationRsvpGuest[];
}