import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationEditorEventFallback,
  InvitationEditorEventTranslations,
  InvitationEditorFallbackTranslations,
} from "@/features/invitations/editor/data/InvitationEditorFallback.types";


/* ==========================================================================
   Get Invitation Editor Fallback Content
========================================================================== */

export function getInvitationEditorFallbackContent(
  translations:
    InvitationEditorFallbackTranslations,

  eventTranslations:
    InvitationEditorEventTranslations,

  eventFallback:
    InvitationEditorEventFallback
): InvitationContent {
  return {
    hero: {
      title:
        eventTranslations.heroTitle,

      subtitle:
        eventTranslations.heroSubtitle,

      first_initial:
        eventFallback.firstInitial,

      second_initial:
        eventFallback.secondInitial,
    },

    description:
      eventTranslations.description,

    date: {
      start_date:
        "2027-06-15",

      end_date:
        "2027-06-16",
    },

    time: {
      start_time:
        "16:00",

      end_time:
        null,
    },

    location: {
      name:
        translations.locationName,

      address:
        translations.locationAddress,
    },

    program:
      [],

    rsvp: {
      enabled:
        true,

      title:
        translations.rsvpTitle,

      description:
        translations.rsvpDescription,

      deadline:
        null,

      allow_response_changes:
        true,

      success_message:
        null,

      questions:
        [],

      allow_generic_responses:
        false,

      collect_generic_email:
        false,

      max_party_size:
        1,

      max_generic_guests:
        null,
    },

    contacts:
      [],

    media: {
      image_url:
        null,
    },

    music: {
      audio_url:
        null,

      enabled:
        false,
    },
  };
}