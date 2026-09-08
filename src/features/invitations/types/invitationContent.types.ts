/* ==========================================================================
   Invitation Hero Content
========================================================================== */

export interface InvitationHeroContent {
  primary_name:
    string | null;

  secondary_name:
    string | null;

  title:
    string | null;

  subtitle:
    string | null;

  first_initial:
    string | null;

  second_initial:
    string | null;
}

/* ==========================================================================
   Invitation Date Content
========================================================================== */

export interface InvitationDateContent {
  start_date:
    string | null;

  end_date:
    string | null;
}


/* ==========================================================================
   Invitation Time Content
========================================================================== */

export interface InvitationTimeContent {
  start_time:
    string | null;

  end_time:
    string | null;
}


/* ==========================================================================
   Invitation Location Content
========================================================================== */

export interface InvitationLocationContent {
  name:
    string | null;

  address:
    string | null;
}


/* ==========================================================================
   Invitation Program Item Content
========================================================================== */

export interface InvitationProgramItemContent {
  id:
    string;

  date:
    string | null;

  title:
    string;

  description:
    string | null;

  start_time:
    string | null;

  end_time:
    string | null;

  location_name:
    string | null;

  address:
    string | null;
}


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
   Invitation Contact Content
========================================================================== */

export interface InvitationContactContent {
  name:
    string;

  phone:
    string | null;

  email:
    string | null;
}


/* ==========================================================================
   Invitation Media Content
========================================================================== */

export interface InvitationMediaContent {
  image_url:
    string | null;
}


/* ==========================================================================
   Invitation Music Content
========================================================================== */

export interface InvitationMusicContent {
  audio_url:
    string | null;

  enabled:
    boolean;
}


/* ==========================================================================
   Invitation Content
========================================================================== */

export interface InvitationContent {
  hero:
    InvitationHeroContent;

  description:
    string | null;

  date:
    InvitationDateContent;

  time:
    InvitationTimeContent;

  location:
    InvitationLocationContent;

  program:
    InvitationProgramItemContent[];

  rsvp:
    InvitationRsvpContent;

  contacts:
    InvitationContactContent[];

  media:
    InvitationMediaContent;

  music:
    InvitationMusicContent;
}