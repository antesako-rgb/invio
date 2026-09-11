import type {
  EventType,
} from "@/features/events/types/event.types";


/* ==========================================================================
   Event Experience Editor Fallback Translations
========================================================================== */

export interface EventExperienceEditorFallbackTranslations {
  locationName:
    string;

  locationAddress:
    string;

  rsvpTitle:
    string;

  rsvpDescription:
    string;
}


/* ==========================================================================
   Event Experience Editor Event Translations
========================================================================== */

export interface EventExperienceEditorEventTranslations {
  heroTitle:
    string;

  heroSubtitle:
    string;

  description:
    string;
}


/* ==========================================================================
   Event Experience Editor Event Fallback
========================================================================== */

export interface EventExperienceEditorEventFallback {
  type:
    EventType;

  primaryName:
    string | null;

  secondaryName:
    string | null;

  firstInitial:
    string;

  secondInitial:
    string | null;
}