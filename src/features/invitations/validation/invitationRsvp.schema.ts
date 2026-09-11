import {
  z,
} from "zod";

import type {
  InvitationRsvpAnswers,
  InvitationRsvpQuestion,
  InvitationRsvpStatus,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Error Codes
========================================================================== */

export const INVITATION_RSVP_VALIDATION_ERRORS = {
  RESPONSE_REQUIRED:
    "response_required",

  ANSWER_REQUIRED:
    "answer_required",
} as const;


/* ==========================================================================
   RSVP Status
========================================================================== */

export const invitationRsvpStatusSchema =
  z.union([
    z.literal(
      "attending"
    ),

    z.literal(
      "declined"
    ),
  ]);


/* ==========================================================================
   RSVP Answer
========================================================================== */

export const invitationRsvpAnswerSchema =
  z.union([
    z.string(),

    z.boolean(),

    z.null(),
  ]);


/* ==========================================================================
   RSVP Answers
========================================================================== */

export const invitationRsvpAnswersSchema =
  z.record(
    z.string(),
    invitationRsvpAnswerSchema
  );


/* ==========================================================================
   RSVP Guest Response
========================================================================== */

export const invitationRsvpGuestResponseSchema =
  z.object({
    guest_id:
      z.string().min(
        1
      ),

    status:
      invitationRsvpStatusSchema,

    answers:
      invitationRsvpAnswersSchema,
  });


/* ==========================================================================
   Required Answer
========================================================================== */

function hasAnswer(
  value:
    InvitationRsvpAnswers[string]
) {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (
    typeof value === "string"
  ) {
    return (
      value.trim().length >
      0
    );
  }

  return true;
}


/* ==========================================================================
   Validate RSVP Answers
========================================================================== */

export function validateInvitationRsvpAnswers(
  status:
    InvitationRsvpStatus | undefined,
  answers:
    InvitationRsvpAnswers,
  questions:
    InvitationRsvpQuestion[]
) {
  const errors:
    Record<
      string,
      string
    > =
    {};


  /* ==========================================================================
     Response
  ========================================================================== */

  if (
    !status
  ) {
    return {
      valid:
        false,

      responseError:
        INVITATION_RSVP_VALIDATION_ERRORS
          .RESPONSE_REQUIRED,

      errors,
    };
  }


  /* ==========================================================================
     Declined
  ========================================================================== */

  if (
    status === "declined"
  ) {
    return {
      valid:
        true,

      responseError:
        null,

      errors,
    };
  }


  /* ==========================================================================
     Required Questions
  ========================================================================== */

  for (
    const question
    of questions
  ) {
    if (
      !question.required
    ) {
      continue;
    }

    const answer =
      answers[
        question.id
      ];

    if (
      !hasAnswer(
        answer
      )
    ) {
      errors[
        question.id
      ] =
        INVITATION_RSVP_VALIDATION_ERRORS
          .ANSWER_REQUIRED;
    }
  }


  /* ==========================================================================
     Result
  ========================================================================== */

  return {
    valid:
      Object.keys(
        errors
      ).length ===
      0,

    responseError:
      null,

    errors,
  };
}