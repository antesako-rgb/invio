import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Create Default Invitation Content
========================================================================== */

export function createDefaultInvitationContent():
  InvitationContent {
  return {
    hero: {
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
      title:
        null,

      description:
        null,

      callout_subtitle:
        null,

      callout_note:
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