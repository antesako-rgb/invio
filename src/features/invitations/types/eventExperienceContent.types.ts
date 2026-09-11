import type {
  InvitationRsvpContent,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Event Experience Hero Content
========================================================================== */

export interface EventExperienceHeroContent {
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
   Event Experience Date Content
========================================================================== */

export interface EventExperienceDateContent {
  start_date:
    string | null;

  end_date:
    string | null;
}


/* ==========================================================================
   Event Experience Time Content
========================================================================== */

export interface EventExperienceTimeContent {
  start_time:
    string | null;

  end_time:
    string | null;
}


/* ==========================================================================
   Event Experience Location Content
========================================================================== */

export interface EventExperienceLocationContent {
  name:
    string | null;

  address:
    string | null;
}


/* ==========================================================================
   Event Experience Program Item Content
========================================================================== */

export interface EventExperienceProgramItemContent {
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
   Event Experience Contact Content
========================================================================== */

export interface EventExperienceContactContent {
  name:
    string;

  phone:
    string | null;

  email:
    string | null;
}


/* ==========================================================================
   Event Experience Media Content
========================================================================== */

export interface EventExperienceMediaContent {
  image_url:
    string | null;
}


/* ==========================================================================
   Event Experience Music Content
========================================================================== */

export interface EventExperienceMusicContent {
  enabled:
    boolean;

  audio_url:
    string | null;
}


/* ==========================================================================
   Event Experience Content
========================================================================== */

export interface EventExperienceContent {
  hero:
    EventExperienceHeroContent;

  description:
    string | null;

  date:
    EventExperienceDateContent;

  time:
    EventExperienceTimeContent;

  location:
    EventExperienceLocationContent;

  program:
    EventExperienceProgramItemContent[];

  rsvp:
    InvitationRsvpContent;

  contacts:
    EventExperienceContactContent[];

  media:
    EventExperienceMediaContent;

  music:
    EventExperienceMusicContent;
}