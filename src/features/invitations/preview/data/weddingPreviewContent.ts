import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Wedding Preview Content
========================================================================== */

export const weddingPreviewContent:
  InvitationContent = {
    hero: {
      primary_name:
        "Matilda",

      secondary_name:
        "Daniel",

      title:
        "Naše vjenčanje",

      subtitle:
        "S velikim veseljem pozivamo vas da budete dio našeg posebnog dana.",

      first_initial:
        "S",

      second_initial:
        "D",
    },

    description:
      "S velikim veseljem pozivamo vas da budete dio našeg posebnog dana.",

    date: {
      start_date:
        "2027-06-15",

      end_date:
        null,
    },

    time: {
      start_time:
        "16:00",

      end_time:
        null,
    },

    location: {
      name:
        "La Grma",

      address:
        "Zagreb",
    },

    program: [
      {
        id:
          "preview-program-1",

        date:
          "2027-06-15",

        title:
          "Ceremonija",

        description:
          null,

        start_time:
          "16:00",

        end_time:
          "17:00",

        location_name:
          "La Grma",

        address:
          "Zagreb",
      },

      {
        id:
          "preview-program-2",

        date:
          "2027-06-15",

        title:
          "Večera i slavlje",

        description:
          null,

        start_time:
          "18:00",

        end_time:
          null,

        location_name:
          "La Grma",

        address:
          "Zagreb",
      },
    ],

    rsvp: {
      enabled:
        true,

      title:
        "Potvrda dolaska",

      description:
        "Molimo vas da potvrdite svoj dolazak.",

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

    contacts: [
      {
        name:
          "Petar",

        phone:
          "+385 91 111 1111",

        email:
          null,
      },

      {
        name:
          "Ivica",

        phone:
          "+385 91 222 2222",

        email:
          null,
      },
    ],

    media: {
      image_url:
        "/invitation-assets/media-card-previews/wedding/couple.avif",
    },

    music: {
      audio_url:
        null,

      enabled:
        false,
    },
  };