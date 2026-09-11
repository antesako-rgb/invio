"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronDown,
  UserRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationRsvpStatusBadge
  from "@/features/invitations/components/invitation-management/InvitationRsvpStatusBadge/InvitationRsvpStatusBadge";

import type {
  InvitationRecipientGuest,
} from "@/features/invitations/types/invitationRecipient.types";

import type {
  InvitationRsvpAnswers,
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationRsvp.types";

import styles
  from "./InvitationRecipientGuestDetails.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientGuestDetailsProps {
  guests:
    InvitationRecipientGuest[];

  questions:
    InvitationRsvpQuestion[];

  selectedGuestId?:
    string;
}

interface GuestAnswer {
  questionId:
    string;

  questionLabel:
    string;

  value:
    string;
}


/* ==========================================================================
   Invitation Recipient Guest Details
========================================================================== */

export default function InvitationRecipientGuestDetails({
  guests,
  questions,
  selectedGuestId,
}: InvitationRecipientGuestDetailsProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.details.rsvp"
    );


  /* ==========================================================================
     Initial Guest
  ========================================================================== */

  const primaryGuest =
    guests.find(
      (guest) =>
        guest.is_primary_recipient
    ) ??
    guests[0] ??
    null;

  const initialGuest =
    (
      selectedGuestId
        ? guests.find(
            (guest) =>
              guest.id ===
              selectedGuestId
          )
        : null
    ) ??
    primaryGuest;


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    openGuestId,
    setOpenGuestId,
  ] =
    useState<string | null>(
      initialGuest?.id ??
      null
    );


  /* ==========================================================================
     Selected Guest
  ========================================================================== */

  useEffect(
    () => {
      if (!selectedGuestId) {
        return;
      }

      const guestExists =
        guests.some(
          (guest) =>
            guest.id ===
            selectedGuestId
        );

      if (!guestExists) {
        return;
      }

      setOpenGuestId(
        selectedGuestId
      );
    },
    [
      guests,
      selectedGuestId,
    ]
  );


  /* ==========================================================================
     Helpers
  ========================================================================== */

  function getGuestName(
    guest:
      InvitationRecipientGuest
  ) {
    return [
      guest.first_name,
      guest.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }


  function getAnswerValue(
    question:
      InvitationRsvpQuestion,
    value:
      string | boolean
  ) {
    if (
      question.type ===
      "yes_no"
    ) {
      return value === true
        ? t(
            "yes"
          )
        : t(
            "no"
          );
    }

    if (
      question.type ===
        "single_choice" &&
      typeof value ===
        "string"
    ) {
      return (
        question.options.find(
          (option) =>
            option.id ===
            value
        )?.label ??
        value
      );
    }

    if (
      typeof value ===
      "string"
    ) {
      return value;
    }

    return null;
  }


  function getGuestAnswers(
    guest:
      InvitationRecipientGuest
  ): GuestAnswer[] {
    if (!guest.rsvp) {
      return [];
    }

    const answers =
      guest.rsvp.answers as
        InvitationRsvpAnswers;

    return questions.flatMap(
      (question) => {
        const value =
          answers[
            question.id
          ];

        if (
          value ===
            undefined ||
          value ===
            null ||
          value ===
            ""
        ) {
          return [];
        }

        const displayValue =
          getAnswerValue(
            question,
            value
          );

        if (!displayValue) {
          return [];
        }

        return [
          {
            questionId:
              question.id,

            questionLabel:
              question.label,

            value:
              displayValue,
          },
        ];
      }
    );
  }


  /* ==========================================================================
     Toggle
  ========================================================================== */

  function handleToggle(
    guestId:
      string
  ) {
    setOpenGuestId(
      (currentGuestId) =>
        currentGuestId ===
        guestId
          ? null
          : guestId
    );
  }


  /* ==========================================================================
     Guest Content
  ========================================================================== */

  function renderGuestContent(
    guest:
      InvitationRecipientGuest
  ) {
    const answers =
      getGuestAnswers(
        guest
      );

    return (
      <div
        className={
          styles.details
        }
      >
        {answers.length >
        0 ? (
          <div
            className={
              styles.answers
            }
          >
            {answers.map(
              (answer) => (
                <div
                  key={
                    answer.questionId
                  }
                  className={
                    styles.answer
                  }
                >
                  <span>
                    {answer.questionLabel}
                  </span>

                  <strong>
                    {answer.value}
                  </strong>
                </div>
              )
            )}
          </div>
        ) : (
          <p
            className={
              styles.empty
            }
          >
            {t(
              "noAnswers"
            )}
          </p>
        )}
      </div>
    );
  }


  /* ==========================================================================
     Empty
  ========================================================================== */

  if (
    guests.length ===
    0
  ) {
    return null;
  }


  /* ==========================================================================
     Single Guest
  ========================================================================== */

  if (
    guests.length ===
    1
  ) {
    const guest =
      guests[0];

    return (
      <div
        className={
          styles.single
        }
      >
        <div
          className={
            styles.singleHeader
          }
        >
          <div
            className={
              styles.identity
            }
          >
            <div
              className={
                styles.avatar
              }
              aria-hidden="true"
            >
              <UserRound />
            </div>

            <strong>
              {getGuestName(
                guest
              )}
            </strong>
          </div>

          <InvitationRsvpStatusBadge
            status={
              guest.rsvp?.status ??
              "pending"
            }
          />
        </div>

        {renderGuestContent(
          guest
        )}
      </div>
    );
  }


  /* ==========================================================================
     Multiple Guests
  ========================================================================== */

  return (
    <div
      className={
        styles.accordion
      }
    >
      {guests.map(
        (guest) => {
          const isOpen =
            openGuestId ===
            guest.id;

          return (
            <div
              key={
                guest.id
              }
              className={
                styles.item
              }
              data-open={
                isOpen
                  ? "true"
                  : "false"
              }
            >
              <button
                type="button"
                className={
                  styles.trigger
                }
                aria-expanded={
                  isOpen
                }
                onClick={
                  () =>
                    handleToggle(
                      guest.id
                    )
                }
              >
                <div
                  className={
                    styles.identity
                  }
                >
                  <div
                    className={
                      styles.avatar
                    }
                    aria-hidden="true"
                  >
                    <UserRound />
                  </div>

                  <strong>
                    {getGuestName(
                      guest
                    )}
                  </strong>
                </div>

                <div
                  className={
                    styles.triggerActions
                  }
                >
                  <InvitationRsvpStatusBadge
                    status={
                      guest.rsvp?.status ??
                      "pending"
                    }
                  />

                  <ChevronDown
                    className={
                      styles.chevron
                    }
                    data-open={
                      isOpen
                        ? "true"
                        : "false"
                    }
                    aria-hidden="true"
                  />
                </div>
              </button>

              {isOpen &&
                renderGuestContent(
                  guest
                )}
            </div>
          );
        }
      )}
    </div>
  );
}