import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Types
========================================================================== */

export interface InvitationEditorFallbackTranslations {
  heroTitle:
    string;

  heroSubtitle:
    string;

  description:
    string;

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
   Get Invitation Editor Fallback Content
========================================================================== */

export function getInvitationEditorFallbackContent(
  translations: InvitationEditorFallbackTranslations
): InvitationContent {
  return {
    hero: {
      title:
        translations.heroTitle,

      subtitle:
        translations.heroSubtitle,

      first_initial:
        "A",

      second_initial:
        "M",
    },

    description:
      translations.description,

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

      success_message:
        null,

      questions:
        [],

      allow_generic_responses:
        false,

      max_party_size:
        1,
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