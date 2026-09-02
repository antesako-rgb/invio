"use client";

import {
  ChevronDown,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationRSVPQuestion
  from "@/features/invitations/experience/rsvp/InvitationRSVPQuestion/InvitationRSVPQuestion";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationRsvpAnswers,
  InvitationRsvpStatus,
  InvitationRsvpAnswerValue,
} from "@/features/invitations/types/invitationRsvp.types";

import "./InvitationRSVPGuest.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPGuestProps {
  guestId:
    string;

  firstName:
    string;

  lastName:
    string | null;

  status:
    InvitationRsvpStatus | undefined;

  answers:
    InvitationRsvpAnswers;

  errors:
    Record<
      string,
      string
    >;

  questions:
    InvitationRsvpQuestion[];

  isExpanded:
    boolean;

  onStatusChange:
    (
      status:
        InvitationRsvpStatus
    ) => void;

  onAnswerChange:
    (
      questionId:
        string,
      value:
        InvitationRsvpAnswerValue
    ) => void;

  onExpandedChange:
    (
      expanded:
        boolean
    ) => void;
}


/* ==========================================================================
   Invitation RSVP Guest
========================================================================== */

export default function InvitationRSVPGuest({
  guestId,
  firstName,
  lastName,
  status,
  answers,
  errors,
  questions,
  isExpanded,
  onStatusChange,
  onAnswerChange,
  onExpandedChange,
}: InvitationRSVPGuestProps) {
  const t =
    useTranslations(
      "Invitations.experience.rsvp"
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const guestName =
    [
      firstName,
      lastName,
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      );

  const hasQuestions =
    questions.length >
    0;

  const canExpand =
    status === "attending" &&
    hasQuestions;


  /* ==========================================================================
     Status
  ========================================================================== */

  function handleStatusChange(
    nextStatus:
      InvitationRsvpStatus
  ) {
    onStatusChange(
      nextStatus
    );

    if (
      nextStatus === "attending" &&
      hasQuestions
    ) {
      onExpandedChange(
        true
      );

      return;
    }

    onExpandedChange(
      false
    );
  }


  /* ==========================================================================
     Toggle
  ========================================================================== */

  function handleToggle() {
    if (
      !canExpand
    ) {
      return;
    }

    onExpandedChange(
      !isExpanded
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-rsvp-guest"
      data-guest-id={
        guestId
      }
      data-status={
        status
      }
      data-expanded={
        canExpand &&
        isExpanded
      }
      data-invalid={
        Object.keys(
          errors
        ).length >
        0
      }
    >
      {/* ==================================================================
          Header
      ================================================================== */}

      <div
        className="invitation-rsvp-guest__header"
      >
        <button
          type="button"
          className="invitation-rsvp-guest__toggle"
          onClick={
            handleToggle
          }
          disabled={
            !canExpand
          }
          aria-expanded={
            canExpand
              ? isExpanded
              : undefined
          }
        >
          <span
            className="invitation-rsvp-guest__name"
          >
            {guestName}
          </span>

          {canExpand && (
            <ChevronDown
              className="invitation-rsvp-guest__chevron"
              aria-hidden="true"
            />
          )}
        </button>


        {/* ================================================================
            Attendance
        ================================================================ */}

        <div
          className="invitation-rsvp-guest__choices"
        >
          <button
            type="button"
            className="invitation-rsvp-guest__choice"
            data-selected={
              status ===
              "attending"
            }
            aria-pressed={
              status ===
              "attending"
            }
            onClick={() =>
              handleStatusChange(
                "attending"
              )
            }
          >
            {t(
              "attending"
            )}
          </button>

          <button
            type="button"
            className="invitation-rsvp-guest__choice"
            data-selected={
              status ===
              "declined"
            }
            aria-pressed={
              status ===
              "declined"
            }
            onClick={() =>
              handleStatusChange(
                "declined"
              )
            }
          >
            {t(
              "declined"
            )}
          </button>
        </div>
      </div>


      {/* ==================================================================
          Questions
      ================================================================== */}

      {canExpand &&
        isExpanded && (
          <div
            className="invitation-rsvp-guest__questions"
          >
            {questions.map(
              (question) => (
                <InvitationRSVPQuestion
                  key={
                    question.id
                  }
                  question={
                    question
                  }
                  value={
                    answers[
                      question.id
                    ] ??
                    null
                  }
                  error={
                    errors[
                      question.id
                    ]
                  }
                  onChange={(
                    value
                  ) =>
                    onAnswerChange(
                      question.id,
                      value
                    )
                  }
                />
              )
            )}
          </div>
        )}
    </div>
  );
}