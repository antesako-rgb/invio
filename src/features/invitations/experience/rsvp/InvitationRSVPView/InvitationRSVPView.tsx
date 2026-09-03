"use client";

import {
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useFormatter,
  useTranslations,
} from "next-intl";

import {
  isDatePassedInTimezone,
  parseDateOnly,
} from "@/lib/utils/timezone";
import InvitationRSVPGuest
  from "@/features/invitations/experience/rsvp/InvitationRSVPGuest/InvitationRSVPGuest";

import {
  useInvitationRSVPForm,
} from "@/features/invitations/experience/rsvp/hooks/useInvitationRSVPForm";

import {
  buildInvitationRsvpSubmissions,
} from "@/features/invitations/utils/buildInvitationRsvpSubmissions";

import type {
  InvitationRenderData,
  InvitationRsvpSubmitHandler,
} from "@/features/invitations/types/invitationRenderer.types";

import type {
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";

import "./InvitationRSVPView.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPViewProps {
  data:
    InvitationRenderData;

  eventTimezone?:
    string;

  previewState?:
    InvitationRSVPViewState;

  onBack?:
    () => void;

  onSubmit?:
    InvitationRsvpSubmitHandler;
}


/* ==========================================================================
   Invitation RSVP View
========================================================================== */

export default function InvitationRSVPView({
  data,
  eventTimezone,
  previewState,
  onBack,
  onSubmit,
}: InvitationRSVPViewProps) {
  const t =
    useTranslations(
      "Invitations.experience.rsvp"
    );

  const format =
    useFormatter();


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    liveState,
    setLiveState,
  ] =
    useState<InvitationRSVPViewState>(
      "form"
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false
    );

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Data
  ========================================================================== */

  const title =
    data.content.hero.title;

  const rsvp =
    data.content.rsvp;

  const guests =
    data.guests;

  const questions =
    rsvp.questions;

  const viewState =
    previewState ??
    liveState;

const deadline =
  rsvp.deadline
    ? format.dateTime(
        parseDateOnly(
          rsvp.deadline
        ),
        {
          day:
            "numeric",

          month:
            "long",

          year:
            "numeric",

          timeZone:
            "UTC",
        }
      )
    : null;

  const isDeadlinePassed =
    previewState ===
      undefined &&
    isDatePassedInTimezone(
      rsvp.deadline,
      eventTimezone
    );


  /* ==========================================================================
     Form
  ========================================================================== */

  const {
    responses,
    answers,
    errors,
    expandedGuestId,
    handleResponse,
    handleAnswerChange,
    handleExpandedChange,
    validate,
  } =
    useInvitationRSVPForm({
      guests,
      questions,
    });


  /* ==========================================================================
     Submit
  ========================================================================== */

async function handleSubmit() {
  if (
    isSubmitting
  ) {
    return;
  }

  if (
    isDeadlinePassed
  ) {
    setSubmitError(
      t(
        "deadlineExpired"
      )
    );

    return;
  }

  const isValid =
    validate();

  if (
    !isValid
  ) {
    return;
  }

  if (
    !onSubmit
  ) {
    return;
  }

  const submissions =
    buildInvitationRsvpSubmissions(
      guests,
      responses,
      answers
    );

  setSubmitError(
    null
  );

  setIsSubmitting(
    true
  );

  try {
    await onSubmit(
      submissions
    );

    if (
      previewState ===
      undefined
    ) {
      setLiveState(
        "success"
      );
    }
  } catch (
    error
  ) {
    setSubmitError(
      error instanceof Error
        ? error.message
        : t(
            "submitError"
          )
    );
  } finally {
    setIsSubmitting(
      false
    );
  }
}


  /* ==========================================================================
     Form
  ========================================================================== */

  function renderForm() {
    return (
      <div
        className="invitation-rsvp-view__content"
      >
        {/* ================================================================
            Guests
        ================================================================ */}

        <section
          className="invitation-rsvp-view__section"
        >
          {guests.map(
            (guest) => (
              <InvitationRSVPGuest
                key={
                  guest.id
                }
                guestId={
                  guest.id
                }
                firstName={
                  guest.firstName
                }
                lastName={
                  guest.lastName
                }
                status={
                  responses[
                    guest.id
                  ]
                }
                answers={
                  answers[
                    guest.id
                  ] ?? {}
                }
                errors={
                  errors[
                    guest.id
                  ] ?? {}
                }
                questions={
                  questions
                }
                isExpanded={
                  expandedGuestId ===
                  guest.id
                }
                onStatusChange={(
                  status
                ) =>
                  handleResponse(
                    guest.id,
                    status
                  )
                }
                onAnswerChange={(
                  questionId,
                  value
                ) =>
                  handleAnswerChange(
                    guest.id,
                    questionId,
                    value
                  )
                }
                onExpandedChange={(
                  expanded
                ) =>
                  handleExpandedChange(
                    guest.id,
                    expanded
                  )
                }
              />
            )
          )}
        </section>


        {/* ================================================================
            Submit Error
        ================================================================ */}

        {submitError && (
          <p
            className="invitation-rsvp-view__submit-error"
            role="alert"
          >
            {submitError}
          </p>
        )}


        {/* ================================================================
            Submit
        ================================================================ */}
<button
  type="button"
  className="invitation-rsvp-view__submit"
  onClick={
    handleSubmit
  }
  disabled={
    isSubmitting
  }
  aria-busy={
    isSubmitting
  }
>
  {isSubmitting
    ? t(
        "submitting"
      )
    : t(
        "submit"
      )}
</button>
      </div>
    );
  }


  /* ==========================================================================
     Success
  ========================================================================== */

  function renderSuccess() {
    return (
      <div
        className="
          invitation-rsvp-view__content
          invitation-rsvp-view__content--success
        "
        data-rsvp-success
      >
        {rsvp.success_message && (
          <p
            className="invitation-rsvp-view__success-message"
          >
            {rsvp.success_message}
          </p>
        )}
      </div>
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-rsvp-view"
      data-invitation-rsvp-view
      data-state={
        viewState
      }
    >
      <div
        className="invitation-rsvp-view__shell"
      >
        {/* ==================================================================
            Header
        ================================================================== */}

        <header
          className="invitation-rsvp-view__header"
        >
          {onBack
            ? (
              <button
                type="button"
                className="invitation-rsvp-view__back"
                onClick={
                  onBack
                }
                aria-label={
                  t(
                    "back"
                  )
                }
              >
                <ArrowLeft
                  aria-hidden="true"
                />
              </button>
            )
            : (
              <div
                className="invitation-rsvp-view__header-spacer"
                aria-hidden="true"
              />
            )}

          {title && (
            <div
              className="invitation-rsvp-view__event"
            >
              {title}
            </div>
          )}

          <div
            className="invitation-rsvp-view__header-spacer"
            aria-hidden="true"
          />
        </header>


        {/* ==================================================================
            Intro
        ================================================================== */}

        <div
          className="invitation-rsvp-view__intro"
        >
          {rsvp.title && (
            <h1
              className="invitation-rsvp-view__title"
            >
              {rsvp.title}
            </h1>
          )}

          <span
            className="invitation-rsvp-view__ornament"
            aria-hidden="true"
          >
            ❧
          </span>

          {rsvp.description && (
            <p
              className="invitation-rsvp-view__description"
            >
              {rsvp.description}
            </p>
          )}

          {viewState === "form" &&
            deadline && (
              <p
                className="invitation-rsvp-view__deadline"
              >
                {t(
                  "deadline",
                  {
                    date:
                      deadline,
                  }
                )}
              </p>
            )}
        </div>


        {/* ==================================================================
            State
        ================================================================== */}

        {viewState === "success"
          ? renderSuccess()
          : renderForm()}
      </div>
    </div>
  );
}