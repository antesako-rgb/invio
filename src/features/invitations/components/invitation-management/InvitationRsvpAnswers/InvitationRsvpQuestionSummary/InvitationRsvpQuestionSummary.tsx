"use client";

import {
  useTranslations,
} from "next-intl";

import type {
  InvitationRecipientGuest,
} from "@/features/invitations/types/invitationRecipient.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationRsvpAnswers,
} from "@/features/invitations/types/invitationRsvp.types";

import styles
  from "./InvitationRsvpQuestionSummary.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRsvpQuestionSummaryProps {
  question:
    InvitationRsvpQuestion;

  guests:
    InvitationRecipientGuest[];

  onGuestClick:
    (guestId: string) => void;
}

interface TextAnswer {
  guestId:
    string;

  guestName:
    string;

  value:
    string;
}


/* ==========================================================================
   Invitation RSVP Question Summary
========================================================================== */

export default function InvitationRsvpQuestionSummary({
  question,
  guests,
  onGuestClick,
}: InvitationRsvpQuestionSummaryProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.rsvpAnswers"
    );


  /* ==========================================================================
     Answers
  ========================================================================== */

  const answers =
    guests.flatMap(
      (guest) => {
        if (
          !guest.rsvp
        ) {
          return [];
        }

        const rsvpAnswers =
          guest.rsvp.answers as
            InvitationRsvpAnswers;

        const value =
          rsvpAnswers[
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

        return [
          {
            guest,
            value,
          },
        ];
      }
    );


  /* ==========================================================================
     Yes / No
  ========================================================================== */

  const yesCount =
    answers.filter(
      ({ value }) =>
        value ===
        true
    ).length;

  const noCount =
    answers.filter(
      ({ value }) =>
        value ===
        false
    ).length;


  /* ==========================================================================
     Text Answers
  ========================================================================== */

  const textAnswers:
    TextAnswer[] =
    answers.flatMap(
      ({
        guest,
        value,
      }) => {
        if (
          typeof value !==
          "string"
        ) {
          return [];
        }

        const guestName =
          [
            guest.first_name,
            guest.last_name,
          ]
            .filter(Boolean)
            .join(" ");

        return [
          {
            guestId:
              guest.id,

            guestName,

            value,
          },
        ];
      }
    );


  /* ==========================================================================
     Render Yes / No
  ========================================================================== */

  function renderYesNo() {
    return (
      <div
        className={
          styles.choiceAnswers
        }
      >
        <div
          className={
            styles.choiceAnswer
          }
        >
          <span>
            {t(
              "yes"
            )}
          </span>

          <strong>
            {yesCount}
          </strong>
        </div>

        <div
          className={
            styles.choiceAnswer
          }
        >
          <span>
            {t(
              "no"
            )}
          </span>

          <strong>
            {noCount}
          </strong>
        </div>
      </div>
    );
  }


  /* ==========================================================================
     Render Single Choice
  ========================================================================== */

  function renderSingleChoice() {
    return (
      <div
        className={
          styles.choiceAnswers
        }
      >
        {question.options.map(
          (option) => {
            const count =
              answers.filter(
                ({ value }) =>
                  value ===
                  option.id
              ).length;

            return (
              <div
                key={
                  option.id
                }
                className={
                  styles.choiceAnswer
                }
              >
                <span>
                  {option.label}
                </span>

                <strong>
                  {count}
                </strong>
              </div>
            );
          }
        )}
      </div>
    );
  }


  /* ==========================================================================
     Render Text
  ========================================================================== */

  function renderText() {
    if (
      textAnswers.length ===
      0
    ) {
      return (
        <p
          className={
            styles.noAnswers
          }
        >
          {t(
            "noAnswers"
          )}
        </p>
      );
    }

    return (
      <div
        className={
          styles.textAnswers
        }
      >
        {textAnswers.map(
          (answer) => (
            <div
              key={
                answer.guestId
              }
              className={
                styles.textAnswer
              }
            >
              <button
                type="button"
                className={
                  styles.guestName
                }
                onClick={
                  () =>
                    onGuestClick(
                      answer.guestId
                    )
                }
              >
                {answer.guestName}
              </button>

              <p>
                {answer.value}
              </p>
            </div>
          )
        )}
      </div>
    );
  }


  /* ==========================================================================
     Answer Content
  ========================================================================== */

  function renderAnswers() {
    switch (
      question.type
    ) {
      case "yes_no":
        return renderYesNo();

      case "single_choice":
        return renderSingleChoice();

      case "text":
      case "textarea":
        return renderText();

      default:
        return null;
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.question
      }
    >
      <div
        className={
          styles.questionHeader
        }
      >
        <strong>
          {question.label}
        </strong>

        <span>
          {t(
            "answerCount",
            {
              count:
                answers.length,
            }
          )}
        </span>
      </div>

      {renderAnswers()}
    </section>
  );
}