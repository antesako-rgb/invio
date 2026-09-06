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

import InvitationGenericRSVPForm
  from "@/features/invitations/experience/rsvp/InvitationGenericRSVPForm/InvitationGenericRSVPForm";

import InvitationRSVPGuest
  from "@/features/invitations/experience/rsvp/InvitationRSVPGuest/InvitationRSVPGuest";

import {
  useInvitationRSVPForm,
} from "@/features/invitations/experience/rsvp/hooks/useInvitationRSVPForm";

import type {
  GenericInvitationRsvpSubmitHandler,
  InvitationRenderData,
  InvitationRsvpSubmitHandler,
} from "@/features/invitations/types/invitationRenderer.types";

import type {
  InvitationRSVPPreviewMode,
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";

import {
  buildInvitationRsvpSubmissions,
} from "@/features/invitations/utils/buildInvitationRsvpSubmissions";

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

  previewMode?:
    InvitationRSVPPreviewMode;

  onBack?:
    () => void;

  onSubmit?:
    InvitationRsvpSubmitHandler;

  onGenericSubmit?:
    GenericInvitationRsvpSubmitHandler;
}


/* ==========================================================================
   Invitation RSVP View
========================================================================== */

export default function InvitationRSVPView({
  data,
  eventTimezone,
  previewState,
  previewMode,
  onBack,
  onSubmit,
  onGenericSubmit,
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

  const isGeneric =
    previewMode !== undefined
      ? previewMode === "generic"
      : onGenericSubmit !==
        undefined;

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

  const editableGuests =
    guests.filter(
      (guest) =>
        guest.rsvp === null ||
        rsvp.allow_response_changes
    );

  const hasEditableGuests =
    editableGuests.length >
    0;


  /* ==========================================================================
     Personalized Form
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
     Personalized Submit
  ========================================================================== */

  async function handleSubmit() {
    if (
      isSubmitting ||
      !rsvp.enabled ||
      !hasEditableGuests
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
        editableGuests,
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
     Generic Success
  ========================================================================== */

  function handleGenericSuccess() {
    if (
      previewState ===
      undefined
    ) {
      setLiveState(
        "success"
      );
    }
  }


  /* ==========================================================================
     Personalized Form
  ========================================================================== */

  function renderPersonalizedForm() {
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
            (guest) => {
              const isLocked =
                guest.rsvp !== null &&
                !rsvp.allow_response_changes;

              return (
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
                  isLocked={
                    isLocked
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
              );
            }
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

        {hasEditableGuests
          ? (
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
          )
          : (
            <p
              className="invitation-rsvp-view__submit-error"
              role="status"
            >
              {t(
                "responseLocked"
              )}
            </p>
          )}
      </div>
    );
  }


  /* ==========================================================================
     Generic Form
  ========================================================================== */
function renderGenericForm() {
  if (
    !onGenericSubmit
  ) {
    return null;
  }

  return (
    <div
      className="invitation-rsvp-view__content"
    >
      <InvitationGenericRSVPForm
        rsvp={
          rsvp
        }
        isDeadlinePassed={
          isDeadlinePassed
        }
        onSubmit={
          onGenericSubmit
        }
        onSuccess={
          handleGenericSuccess
        }
      />
    </div>
  );
}


  /* ==========================================================================
     Form
  ========================================================================== */

  function renderForm() {
    if (
      isGeneric
    ) {
      return renderGenericForm();
    }

    return renderPersonalizedForm();
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
     Disabled
  ========================================================================== */

  function renderDisabled() {
    return (
      <div
        className="
          invitation-rsvp-view__content
          invitation-rsvp-view__content--disabled
        "
        data-rsvp-disabled
      >
        <p
          className="invitation-rsvp-view__disabled-title"
        >
          {t(
            "disabled.title"
          )}
        </p>

        <p
          className="invitation-rsvp-view__disabled-description"
        >
          {t(
            "disabled.description"
          )}
        </p>
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
      data-rsvp-mode={
        isGeneric
          ? "generic"
          : "personalized"
      }
      data-state={
        rsvp.enabled
          ? viewState
          : "disabled"
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

        {rsvp.enabled && (
          <div
            className="invitation-rsvp-view__intro"
          >
            <h1
              className="invitation-rsvp-view__title"
            >
              {rsvp.title ??
                t(
                  "title"
                )}
            </h1>

            <span
              className="invitation-rsvp-view__ornament"
              aria-hidden="true"
            >
              ❧
            </span>

            {viewState === "form" && (
              <p
                className="invitation-rsvp-view__description"
              >
                {rsvp.description ??
                  t(
                    "description"
                  )}
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
        )}


        {/* ==================================================================
            State
        ================================================================== */}

        {!rsvp.enabled
          ? renderDisabled()
          : viewState === "success"
            ? renderSuccess()
            : renderForm()}
      </div>
    </div>
  );
}