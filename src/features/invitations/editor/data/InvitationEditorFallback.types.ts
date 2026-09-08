import type {
  EventType,
} from "@/features/events/types/event.types";


/* ==========================================================================
   Invitation Editor Fallback Translations
========================================================================== */

export interface InvitationEditorFallbackTranslations {
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
   Invitation Editor Event Translations
========================================================================== */

export interface InvitationEditorEventTranslations {
  heroTitle:
    string;

  heroSubtitle:
    string;

  description:
    string;
}


/* ==========================================================================
   Invitation Editor Event Fallback
========================================================================== */

export interface InvitationEditorEventFallback {
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