"use client";

import {
  useTranslations,
} from "next-intl";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationRsvp.types";

import type {
  InvitationRsvpAnswerValue,
} from "@/features/invitations/types/invitationRsvp.types";

import "./InvitationRSVPQuestion.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPQuestionProps {
  question:
    InvitationRsvpQuestion;

  value:
    InvitationRsvpAnswerValue;

  error?:
    string;

  disabled?:
    boolean;

  onChange:
    (
      value:
        InvitationRsvpAnswerValue
    ) => void;
}


/* ==========================================================================
   Invitation RSVP Question
========================================================================== */

export default function InvitationRSVPQuestion({
  question,
  value,
  error,
  disabled = false,
  onChange,
}: InvitationRSVPQuestionProps) {
  const t =
    useTranslations(
      "Invitations.experience.rsvp"
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const errorId =
    `invitation-rsvp-question-${question.id}-error`;

  const hasError =
    Boolean(
      error
    );


  /* ==========================================================================
     Text
  ========================================================================== */

  function renderText() {
    return (
      <input
        type="text"
        className="invitation-rsvp-question__input"
        value={
          typeof value === "string"
            ? value
            : ""
        }
        disabled={
          disabled
        }
        aria-invalid={
          hasError
        }
        aria-describedby={
          hasError
            ? errorId
            : undefined
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      />
    );
  }


  /* ==========================================================================
     Textarea
  ========================================================================== */

  function renderTextarea() {
    return (
      <textarea
        className="invitation-rsvp-question__textarea"
        rows={
          3
        }
        value={
          typeof value === "string"
            ? value
            : ""
        }
        disabled={
          disabled
        }
        aria-invalid={
          hasError
        }
        aria-describedby={
          hasError
            ? errorId
            : undefined
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      />
    );
  }


  /* ==========================================================================
     Single Choice
  ========================================================================== */

  function renderSingleChoice() {
    return (
      <div
        className="invitation-rsvp-question__options"
        aria-invalid={
          hasError
        }
        aria-describedby={
          hasError
            ? errorId
            : undefined
        }
      >
        {question.options.map(
          (option) => {
            const isSelected =
              value ===
              option.id;

            return (
              <button
                key={
                  option.id
                }
                type="button"
                className="invitation-rsvp-question__option"
                data-selected={
                  isSelected
                }
                aria-pressed={
                  isSelected
                }
                disabled={
                  disabled
                }
                onClick={() =>
                  onChange(
                    option.id
                  )
                }
              >
                {option.label}
              </button>
            );
          }
        )}
      </div>
    );
  }


  /* ==========================================================================
     Yes / No
  ========================================================================== */

  function renderYesNo() {
    return (
      <div
        className="invitation-rsvp-question__options"
        aria-invalid={
          hasError
        }
        aria-describedby={
          hasError
            ? errorId
            : undefined
        }
      >
        <button
          type="button"
          className="invitation-rsvp-question__option"
          data-selected={
            value === true
          }
          aria-pressed={
            value === true
          }
          disabled={
            disabled
          }
          onClick={() =>
            onChange(
              true
            )
          }
        >
          {t(
            "yes"
          )}
        </button>

        <button
          type="button"
          className="invitation-rsvp-question__option"
          data-selected={
            value === false
          }
          aria-pressed={
            value === false
          }
          disabled={
            disabled
          }
          onClick={() =>
            onChange(
              false
            )
          }
        >
          {t(
            "no"
          )}
        </button>
      </div>
    );
  }


  /* ==========================================================================
     Control
  ========================================================================== */

  function renderControl() {
    switch (
      question.type
    ) {
      case "textarea":
        return renderTextarea();

      case "single_choice":
        return renderSingleChoice();

      case "yes_no":
        return renderYesNo();

      case "text":
      default:
        return renderText();
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-rsvp-question"
      data-question-type={
        question.type
      }
      data-invalid={
        hasError
      }
      data-disabled={
        disabled
      }
    >
      <div
        className="invitation-rsvp-question__label"
      >
        {question.label}

        {question.required && (
          <span
            className="invitation-rsvp-question__required"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </div>

      {renderControl()}

      {error && (
        <p
          id={
            errorId
          }
          className="invitation-rsvp-question__error"
          role="alert"
        >
          {t(
            `validation.${error}`
          )}
        </p>
      )}
    </div>
  );
}