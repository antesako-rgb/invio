import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import type {
  InvitationContent,
  InvitationRsvpQuestion,
  InvitationRsvpQuestionOption,
  InvitationRsvpQuestionType,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Helpers
========================================================================== */

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function isRsvpQuestionType(
  value: unknown
): value is InvitationRsvpQuestionType {
  return (
    value ===
      "text" ||
    value ===
      "textarea" ||
    value ===
      "single_choice" ||
    value ===
      "yes_no"
  );
}


/* ==========================================================================
   Parse RSVP Question Options
========================================================================== */

function parseRsvpQuestionOptions(
  value: unknown
): InvitationRsvpQuestionOption[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value.flatMap(
    (option) => {
      if (
        !isRecord(
          option
        ) ||
        typeof option.id !==
          "string" ||
        typeof option.label !==
          "string"
      ) {
        return [];
      }

      return [
        {
          id:
            option.id,

          label:
            option.label,
        },
      ];
    }
  );
}


/* ==========================================================================
   Parse RSVP Questions
========================================================================== */

function parseRsvpQuestions(
  value: unknown
): InvitationRsvpQuestion[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value.flatMap(
    (question) => {
      if (
        !isRecord(
          question
        ) ||
        typeof question.id !==
          "string" ||
        !isRsvpQuestionType(
          question.type
        ) ||
        typeof question.label !==
          "string"
      ) {
        return [];
      }

      return [
        {
          id:
            question.id,

          type:
            question.type,

          label:
            question.label,

          required:
            typeof question.required ===
              "boolean"
              ? question.required
              : false,

          options:
            parseRsvpQuestionOptions(
              question.options
            ),
        },
      ];
    }
  );
}


/* ==========================================================================
   Parse Invitation Content
========================================================================== */

export function parseInvitationContent(
  content: Invitation["content"]
): InvitationContent {
  const value =
    isRecord(
      content
    )
      ? content
      : {};

  const hero =
    isRecord(
      value.hero
    )
      ? value.hero
      : {};

  const date =
    isRecord(
      value.date
    )
      ? value.date
      : {};

  const time =
    isRecord(
      value.time
    )
      ? value.time
      : {};

  const location =
    isRecord(
      value.location
    )
      ? value.location
      : {};

  const rsvp =
    isRecord(
      value.rsvp
    )
      ? value.rsvp
      : {};

  const media =
    isRecord(
      value.media
    )
      ? value.media
      : {};

  const music =
    isRecord(
      value.music
    )
      ? value.music
      : {};

  return {
    hero: {
      title:
        typeof hero.title ===
          "string"
          ? hero.title
          : null,

      subtitle:
        typeof hero.subtitle ===
          "string"
          ? hero.subtitle
          : null,

      first_initial:
        typeof hero.first_initial ===
          "string"
          ? hero.first_initial
          : null,

      second_initial:
        typeof hero.second_initial ===
          "string"
          ? hero.second_initial
          : null,
    },

    description:
      typeof value.description ===
        "string"
        ? value.description
        : null,

    date: {
      start_date:
        typeof date.start_date ===
          "string"
          ? date.start_date
          : null,

      end_date:
        typeof date.end_date ===
          "string"
          ? date.end_date
          : null,
    },

    time: {
      start_time:
        typeof time.start_time ===
          "string"
          ? time.start_time
          : null,

      end_time:
        typeof time.end_time ===
          "string"
          ? time.end_time
          : null,
    },

    location: {
      name:
        typeof location.name ===
          "string"
          ? location.name
          : null,

      address:
        typeof location.address ===
          "string"
          ? location.address
          : null,
    },

    program:
      Array.isArray(
        value.program
      )
        ? value.program.flatMap(
            (
              item,
              index
            ) => {
              if (
                !isRecord(
                  item
                ) ||
                typeof item.title !==
                  "string"
              ) {
                return [];
              }

              return [
                {
                  id:
                    typeof item.id ===
                      "string"
                      ? item.id
                      : `program-${index}`,

                  date:
                    typeof item.date ===
                      "string"
                      ? item.date
                      : null,

                  title:
                    item.title,

                  description:
                    typeof item.description ===
                      "string"
                      ? item.description
                      : null,

                  start_time:
                    typeof item.start_time ===
                      "string"
                      ? item.start_time
                      : null,

                  end_time:
                    typeof item.end_time ===
                      "string"
                      ? item.end_time
                      : null,

                  location_name:
                    typeof item.location_name ===
                      "string"
                      ? item.location_name
                      : null,

                  address:
                    typeof item.address ===
                      "string"
                      ? item.address
                      : null,
                },
              ];
            }
          )
        : [],

    rsvp: {
      enabled:
        typeof rsvp.enabled ===
          "boolean"
          ? rsvp.enabled
          : true,

      title:
        typeof rsvp.title ===
          "string"
          ? rsvp.title
          : null,

      description:
        typeof rsvp.description ===
          "string"
          ? rsvp.description
          : null,

      deadline:
        typeof rsvp.deadline ===
          "string"
          ? rsvp.deadline
          : null,

      allow_response_changes:
        typeof rsvp.allow_response_changes ===
          "boolean"
          ? rsvp.allow_response_changes
          : true,

      success_message:
        typeof rsvp.success_message ===
          "string"
          ? rsvp.success_message
          : null,

      questions:
        parseRsvpQuestions(
          rsvp.questions
        ),

      allow_generic_responses:
        typeof rsvp.allow_generic_responses ===
          "boolean"
          ? rsvp.allow_generic_responses
          : false,

      collect_generic_email:
        typeof rsvp.collect_generic_email ===
          "boolean"
          ? rsvp.collect_generic_email
          : false,

      max_party_size:
        typeof rsvp.max_party_size ===
          "number" &&
        Number.isInteger(
          rsvp.max_party_size
        ) &&
        rsvp.max_party_size >
          0
          ? rsvp.max_party_size
          : 1,

      max_generic_guests:
        typeof rsvp.max_generic_guests ===
          "number" &&
        Number.isInteger(
          rsvp.max_generic_guests
        ) &&
        rsvp.max_generic_guests >
          0
          ? rsvp.max_generic_guests
          : null,
    },

    contacts:
      Array.isArray(
        value.contacts
      )
        ? value.contacts.flatMap(
            (contact) => {
              if (
                !isRecord(
                  contact
                ) ||
                typeof contact.name !==
                  "string"
              ) {
                return [];
              }

              return [
                {
                  name:
                    contact.name,

                  phone:
                    typeof contact.phone ===
                      "string"
                      ? contact.phone
                      : null,

                  email:
                    typeof contact.email ===
                      "string"
                      ? contact.email
                      : null,
                },
              ];
            }
          )
        : [],

    media: {
      image_url:
        typeof media.image_url ===
          "string"
          ? media.image_url
          : null,
    },

    music: {
      audio_url:
        typeof music.audio_url ===
          "string"
          ? music.audio_url
          : null,

      enabled:
        typeof music.enabled ===
          "boolean"
          ? music.enabled
          : false,
    },
  };
}