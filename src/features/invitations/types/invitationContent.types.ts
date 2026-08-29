/* ==========================================================================
   Invitation Hero Content
========================================================================== */

export interface InvitationHeroContent {
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
   Invitation RSVP Content
========================================================================== */

export interface InvitationRsvpContent {
  title:
    string | null;

  description:
    string | null;

  callout_subtitle:
    string | null;

  callout_note:
    string | null;
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