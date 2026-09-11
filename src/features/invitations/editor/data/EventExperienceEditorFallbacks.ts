import type {
  EventType,
} from "@/features/events/types/event.types";

import type {
  EventExperienceEditorEventFallback,
} from "./EventExperienceEditorFallback.types";


/* ==========================================================================
   Wedding Editor Fallback
========================================================================== */

export const weddingEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "wedding",

    primaryName:
      "Matilda",

    secondaryName:
      "Daniel",

    firstInitial:
      "M",

    secondInitial:
      "D",
  };


/* ==========================================================================
   Confirmation Editor Fallback
========================================================================== */

export const confirmationEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "confirmation",

    primaryName:
      "Matilda",

    secondaryName:
      null,

    firstInitial:
      "M",

    secondInitial:
      null,
  };


/* ==========================================================================
   Baptism Editor Fallback
========================================================================== */

export const baptismEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "baptism",

    primaryName:
      "Ana",

    secondaryName:
      null,

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Communion Editor Fallback
========================================================================== */

export const communionEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "communion",

    primaryName:
      "Ana",

    secondaryName:
      null,

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Birthday Editor Fallback
========================================================================== */

export const birthdayEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "birthday",

    primaryName:
      "Ana",

    secondaryName:
      null,

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Other Private Editor Fallback
========================================================================== */

export const otherPrivateEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "other_private",

    primaryName:
      "Ana",

    secondaryName:
      null,

    firstInitial:
      "A",

    secondInitial:
      null,
  };


/* ==========================================================================
   Conference Editor Fallback
========================================================================== */

export const conferenceEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "conference",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "C",

    secondInitial:
      null,
  };


/* ==========================================================================
   Seminar Editor Fallback
========================================================================== */

export const seminarEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "seminar",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "S",

    secondInitial:
      null,
  };


/* ==========================================================================
   Team Building Editor Fallback
========================================================================== */

export const teamBuildingEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "team_building",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "T",

    secondInitial:
      null,
  };


/* ==========================================================================
   Reception Editor Fallback
========================================================================== */

export const receptionEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "reception",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "R",

    secondInitial:
      null,
  };


/* ==========================================================================
   Gala Dinner Editor Fallback
========================================================================== */

export const galaDinnerEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "gala_dinner",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "G",

    secondInitial:
      null,
  };


/* ==========================================================================
   Other Business Editor Fallback
========================================================================== */

export const otherBusinessEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "other_business",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "E",

    secondInitial:
      null,
  };


/* ==========================================================================
   Festival Editor Fallback
========================================================================== */

export const festivalEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "festival",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "F",

    secondInitial:
      null,
  };


/* ==========================================================================
   Charity Editor Fallback
========================================================================== */

export const charityEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "charity",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "C",

    secondInitial:
      null,
  };


/* ==========================================================================
   Sports Editor Fallback
========================================================================== */

export const sportsEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "sports",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "S",

    secondInitial:
      null,
  };


/* ==========================================================================
   Cultural Editor Fallback
========================================================================== */

export const culturalEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "cultural",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "C",

    secondInitial:
      null,
  };


/* ==========================================================================
   Music Editor Fallback
========================================================================== */

export const musicEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "music",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "M",

    secondInitial:
      null,
  };


/* ==========================================================================
   Other Social Editor Fallback
========================================================================== */

export const otherSocialEditorFallback:
  EventExperienceEditorEventFallback = {
    type:
      "other_social",

    primaryName:
      null,

    secondaryName:
      null,

    firstInitial:
      "E",

    secondInitial:
      null,
  };


/* ==========================================================================
   Get Event Experience Editor Fallback
========================================================================== */

export function getEventExperienceEditorFallback(
  eventType:
    EventType
): EventExperienceEditorEventFallback {
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