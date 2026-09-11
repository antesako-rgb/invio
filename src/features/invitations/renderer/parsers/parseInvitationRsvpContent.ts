import type {
  InvitationRsvpContent,
  InvitationRsvpQuestion,
  InvitationRsvpQuestionOption,
  InvitationRsvpQuestionType,
} from "@/features/invitations/types/invitationRsvp.types";


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
   Parse Invitation RSVP Content
========================================================================== */

export function parseInvitationRsvpContent(
  value: unknown
): InvitationRsvpContent {
  const rsvp =
    isRecord(
      value
    )
      ? value
      : {};

  return {
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

    callout_subtitle:
      typeof rsvp.callout_subtitle ===
        "string"
        ? rsvp.callout_subtitle
        : null,

    callout_note:
      typeof rsvp.callout_note ===
        "string"
        ? rsvp.callout_note
        : null,

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
  };
}