import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperienceEditorEventFallback,
  EventExperienceEditorEventTranslations,
  EventExperienceEditorFallbackTranslations,
} from "@/features/invitations/editor/data/EventExperienceEditorFallback.types";


/* ==========================================================================
   Get Event Experience Editor Fallback Content
========================================================================== */

export function getEventExperienceEditorFallbackContent(
  translations:
    EventExperienceEditorFallbackTranslations,

  eventTranslations:
    EventExperienceEditorEventTranslations,

  eventFallback:
    EventExperienceEditorEventFallback
): EventExperienceContent {
  const {
    primaryName,
    secondaryName,
    firstInitial,
    secondInitial,
  } =
    eventFallback;

  return {
    hero: {
      primary_name:
        primaryName,

      secondary_name:
        secondaryName,

      title:
        eventTranslations.heroTitle,

      subtitle:
        eventTranslations.heroSubtitle,

      first_initial:
        firstInitial,

      second_initial:
        secondInitial,
    },

    description:
      eventTranslations.description,

    date: {
      start_date:
        "2027-06-15",

      end_date:
        null,
    },

    time: {
      start_time:
        null,

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

      callout_subtitle:
        null,

      callout_note:
        null,

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