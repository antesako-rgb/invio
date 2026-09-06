import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  InvitationEditorEventFallback,
} from "./InvitationEditorFallback.types";


/* ==========================================================================
   Wedding Editor Fallback
========================================================================== */

export const weddingEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "wedding",

    firstInitial:
      "A",

    secondInitial:
      "M",
  };


/* ==========================================================================
   Confirmation Editor Fallback
========================================================================== */

export const confirmationEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "confirmation",

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Baptism Editor Fallback
========================================================================== */

export const baptismEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "baptism",

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Communion Editor Fallback
========================================================================== */

export const communionEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "communion",

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Birthday Editor Fallback
========================================================================== */

export const birthdayEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "birthday",

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Other Private Editor Fallback
========================================================================== */

export const otherPrivateEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "other_private",

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Conference Editor Fallback
========================================================================== */

export const conferenceEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "conference",

    firstInitial:
      "C",

    secondInitial:
      null,
  };


/* ==========================================================================
   Seminar Editor Fallback
========================================================================== */

export const seminarEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "seminar",

    firstInitial:
      "S",

    secondInitial:
      null,
  };


/* ==========================================================================
   Team Building Editor Fallback
========================================================================== */

export const teamBuildingEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "team_building",

    firstInitial:
      "T",

    secondInitial:
      null,
  };


/* ==========================================================================
   Reception Editor Fallback
========================================================================== */

export const receptionEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "reception",

    firstInitial:
      "R",

    secondInitial:
      null,
  };


/* ==========================================================================
   Gala Dinner Editor Fallback
========================================================================== */

export const galaDinnerEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "gala_dinner",

    firstInitial:
      "G",

    secondInitial:
      null,
  };


/* ==========================================================================
   Other Business Editor Fallback
========================================================================== */

export const otherBusinessEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "other_business",

    firstInitial:
      "E",

    secondInitial:
      null,
  };


/* ==========================================================================
   Festival Editor Fallback
========================================================================== */

export const festivalEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "festival",

    firstInitial:
      "F",

    secondInitial:
      null,
  };


/* ==========================================================================
   Charity Editor Fallback
========================================================================== */

export const charityEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "charity",

    firstInitial:
      "C",

    secondInitial:
      null,
  };


/* ==========================================================================
   Sports Editor Fallback
========================================================================== */

export const sportsEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "sports",

    firstInitial:
      "S",

    secondInitial:
      null,
  };


/* ==========================================================================
   Cultural Editor Fallback
========================================================================== */

export const culturalEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "cultural",

    firstInitial:
      "C",

    secondInitial:
      null,
  };


/* ==========================================================================
   Music Editor Fallback
========================================================================== */

export const musicEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "music",

    firstInitial:
      "M",

    secondInitial:
      null,
  };


/* ==========================================================================
   Other Social Editor Fallback
========================================================================== */

export const otherSocialEditorFallback:
  InvitationEditorEventFallback = {
    type:
      "other_social",

    firstInitial:
      "E",

    secondInitial:
      null,
  };


/* ==========================================================================
   Get Invitation Editor Fallback
========================================================================== */

export function getInvitationEditorFallback(
  eventType:
    EventType
): InvitationEditorEventFallback {
  switch (eventType) {
    case "wedding":
      return weddingEditorFallback;

    case "confirmation":
      return confirmationEditorFallback;

    case "baptism":
      return baptismEditorFallback;

    case "communion":
      return communionEditorFallback;

    case "birthday":
      return birthdayEditorFallback;

    case "other_private":
      return otherPrivateEditorFallback;

    case "conference":
      return conferenceEditorFallback;

    case "seminar":
      return seminarEditorFallback;

    case "team_building":
      return teamBuildingEditorFallback;

    case "reception":
      return receptionEditorFallback;

    case "gala_dinner":
      return galaDinnerEditorFallback;

    case "other_business":
      return otherBusinessEditorFallback;

    case "festival":
      return festivalEditorFallback;

    case "charity":
      return charityEditorFallback;

    case "sports":
      return sportsEditorFallback;

    case "cultural":
      return culturalEditorFallback;

    case "music":
      return musicEditorFallback;

    case "other_social":
      return otherSocialEditorFallback;
  }
}