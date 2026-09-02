import {
  useState,
} from "react";

import {
  validateInvitationRsvpAnswers,
} from "@/features/invitations/validation/invitationRsvp.schema";

import type {
  InvitationRenderGuest,
} from "@/features/invitations/types/invitationRenderer.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationRsvpAnswers,
  InvitationRsvpAnswerValue,
  InvitationRsvpStatus,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Types
========================================================================== */

export type InvitationRSVPGuestErrors =
  Record<
    string,
    Record<
      string,
      string
    >
  >;

interface UseInvitationRSVPFormOptions {
  guests:
    InvitationRenderGuest[];

  questions:
    InvitationRsvpQuestion[];
}


/* ==========================================================================
   Invitation RSVP Form
========================================================================== */

export function useInvitationRSVPForm({
  guests,
  questions,
}: UseInvitationRSVPFormOptions) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    responses,
    setResponses,
  ] =
    useState<
      Record<
        string,
        InvitationRsvpStatus | undefined
      >
    >(() =>
      Object.fromEntries(
        guests.map(
          (guest) => [
            guest.id,
            "attending" as InvitationRsvpStatus,
          ]
        )
      )
    );

  const [
    answers,
    setAnswers,
  ] =
    useState<
      Record<
        string,
        InvitationRsvpAnswers
      >
    >(() =>
      Object.fromEntries(
        guests.map(
          (guest) => [
            guest.id,
            {},
          ]
        )
      )
    );

  const [
    errors,
    setErrors,
  ] =
    useState<
      InvitationRSVPGuestErrors
    >({});

  const [
    expandedGuestId,
    setExpandedGuestId,
  ] =
    useState<
      string | null
    >(() =>
      questions.length > 0 &&
      guests.length > 0
        ? guests[0].id
        : null
    );


  /* ==========================================================================
     Response
  ========================================================================== */

  function handleResponse(
    guestId:
      string,
    status:
      InvitationRsvpStatus
  ) {
    setResponses(
      (current) => ({
        ...current,

        [guestId]:
          status,
      })
    );

    if (
      status !== "declined"
    ) {
      return;
    }

    setErrors(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          guestId
        ];

        return next;
      }
    );
  }


  /* ==========================================================================
     Answer
  ========================================================================== */

  function handleAnswerChange(
    guestId:
      string,
    questionId:
      string,
    value:
      InvitationRsvpAnswerValue
  ) {
    setAnswers(
      (current) => ({
        ...current,

        [guestId]: {
          ...current[
            guestId
          ],

          [questionId]:
            value,
        },
      })
    );

    setErrors(
      (current) => {
        const guestErrors =
          current[
            guestId
          ];

        if (
          !guestErrors?.[
            questionId
          ]
        ) {
          return current;
        }

        const nextGuestErrors = {
          ...guestErrors,
        };

        delete nextGuestErrors[
          questionId
        ];

        const next = {
          ...current,
        };

        if (
          Object.keys(
            nextGuestErrors
          ).length ===
          0
        ) {
          delete next[
            guestId
          ];

          return next;
        }

        next[
          guestId
        ] =
          nextGuestErrors;

        return next;
      }
    );
  }


  /* ==========================================================================
     Expanded Guest
  ========================================================================== */

  function handleExpandedChange(
    guestId:
      string,
    expanded:
      boolean
  ) {
    setExpandedGuestId(
      expanded
        ? guestId
        : null
    );
  }


  /* ==========================================================================
     Validate
  ========================================================================== */

  function validate() {
    const nextErrors:
      InvitationRSVPGuestErrors =
      {};

    let firstInvalidGuestId:
      string | null =
      null;

    for (
      const guest
      of guests
    ) {
      const result =
        validateInvitationRsvpAnswers(
          responses[
            guest.id
          ],
          answers[
            guest.id
          ] ?? {},
          questions
        );

      if (
        result.valid
      ) {
        continue;
      }

      if (
        Object.keys(
          result.errors
        ).length >
        0
      ) {
        nextErrors[
          guest.id
        ] =
          result.errors;
      }

      firstInvalidGuestId ??=
        guest.id;
    }

    setErrors(
      nextErrors
    );

    if (
      firstInvalidGuestId
    ) {
      setExpandedGuestId(
        firstInvalidGuestId
      );

      return false;
    }

    return true;
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    responses,
    answers,
    errors,
    expandedGuestId,

    handleResponse,
    handleAnswerChange,
    handleExpandedChange,
    validate,
  };
}