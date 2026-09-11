import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";


/* ==========================================================================
   Create Default Event Experience Content
========================================================================== */

export function createDefaultEventExperienceContent():
  EventExperienceContent {
  return {
    hero: {
      primary_name:
        null,

      secondary_name:
        null,

      title:
        null,

      subtitle:
        null,

      first_initial:
        null,

      second_initial:
        null,
    },

    description:
      null,

    date: {
      start_date:
        null,

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
        null,

      address:
        null,
    },

    program:
      [],

    rsvp: {
      enabled:
        true,

      title:
        null,

      description:
        null,

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