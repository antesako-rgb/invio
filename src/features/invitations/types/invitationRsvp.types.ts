import type {
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
  | "attending"
  | "declined";


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
   Invitation RSVP Question Type
========================================================================== */

export type InvitationRsvpQuestionType =
  | "text"
  | "textarea"
  | "single_choice"
  | "yes_no";


/* ==========================================================================
   Invitation RSVP Question Option
========================================================================== */

export interface InvitationRsvpQuestionOption {
  id:
    string;

  label:
    string;
}


/* ==========================================================================
   Invitation RSVP Question
========================================================================== */

export interface InvitationRsvpQuestion {
  id:
    string;

  type:
    InvitationRsvpQuestionType;

  label:
    string;

  required:
    boolean;

  options:
    InvitationRsvpQuestionOption[];
}


/* ==========================================================================
   Invitation RSVP Content
========================================================================== */

export interface InvitationRsvpContent {
  enabled:
    boolean;

  title:
    string | null;

  description:
    string | null;

  deadline:
    string | null;

  allow_response_changes:
    boolean;

  callout_subtitle:
    string | null;

  callout_note:
    string | null;

  success_message:
    string | null;

  questions:
    InvitationRsvpQuestion[];

  allow_generic_responses:
    boolean;

  collect_generic_email:
    boolean;

  max_party_size:
    number;

  max_generic_guests:
    number | null;
}


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

export interface SubmitInvitationRsvpInput {
  recipientPublicId:
    string;

  responses:
    InvitationRsvpSubmission[];
}


/* ==========================================================================
   Generic Invitation RSVP Guest
========================================================================== */

export interface GenericInvitationRsvpGuest {
  first_name:
    string;

  last_name:
    string | null;

  email:
    string | null;

  answers:
    InvitationRsvpAnswers;
}


/* ==========================================================================
   Submit Generic Invitation RSVP Input
========================================================================== */

export interface SubmitGenericInvitationRsvpInput {
  invitationPublicId:
    string;

  guests:
    GenericInvitationRsvpGuest[];
}
