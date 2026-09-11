"use client";

import {
  useState,
} from "react";

import {
  Minus,
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationRSVPQuestion
  from "@/features/invitations/components/invitation-experience/rsvp/InvitationRSVPQuestion/InvitationRSVPQuestion";

import type {
  GenericInvitationRsvpGuest,
  InvitationRsvpAnswerValue,
  InvitationRsvpAnswers,
  InvitationRsvpContent,
} from "@/features/invitations/types/invitationRsvp.types";

import type {
  GenericInvitationRsvpSubmitHandler,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import "./InvitationGenericRSVPForm.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationGenericRSVPFormProps {
  rsvp:
    InvitationRsvpContent;

  isDeadlinePassed:
    boolean;

  onSubmit:
    GenericInvitationRsvpSubmitHandler;

  onSuccess:
    () => void;
}

interface GenericGuestFormValue {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  answers:
    InvitationRsvpAnswers;
}

interface GenericGuestErrors {
  firstName?:
    string;

  email?:
    string;

  answers:
    Record<string, string>;
}


/* ==========================================================================
   Helpers
========================================================================== */

function createGuest():
  GenericGuestFormValue {
  return {
    id:
      crypto.randomUUID(),

    firstName:
      "",

    lastName:
      "",

    email:
      "",

    answers:
      {},
  };
}


/* ==========================================================================
   Generic RSVP Form
========================================================================== */

export default function InvitationGenericRSVPForm({
  rsvp,
  isDeadlinePassed,
  onSubmit,
  onSuccess,
}: InvitationGenericRSVPFormProps) {
  const t =
    useTranslations(
      "Invitations.experience.rsvp.generic"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    guests,
    setGuests,
  ] =
    useState<GenericGuestFormValue[]>(
      () => [
        createGuest(),
      ]
    );

  const [
    errors,
    setErrors,
  ] =
    useState<
      Record<
        string,
        GenericGuestErrors
      >
    >(
      {}
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

  const maxPartySize =
    Math.max(
      1,
      rsvp.max_party_size
    );

  const canAddGuest =
    guests.length <
    maxPartySize;

  const collectGenericEmail =
    rsvp.collect_generic_email ??
    false;


  /* ==========================================================================
     Guest
  ========================================================================== */

  function updateGuest(
    guestId: string,
    update:
      Partial<GenericGuestFormValue>
  ) {
    setGuests(
      (current) =>
        current.map(
          (guest) =>
            guest.id ===
            guestId
              ? {
                  ...guest,
                  ...update,
                }
              : guest
        )
    );
  }

  function handleAddGuest() {
    if (
      !canAddGuest
    ) {
      return;
    }

    setGuests(
      (current) => [
        ...current,
        createGuest(),
      ]
    );
  }

  function handleRemoveGuest(
    guestId: string
  ) {
    if (
      guests.length <=
      1
    ) {
      return;
    }

    setGuests(
      (current) =>
        current.filter(
          (guest) =>
            guest.id !==
            guestId
        )
    );

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
     Answers
  ========================================================================== */

  function handleAnswerChange(
    guestId: string,
    questionId: string,
    value: InvitationRsvpAnswerValue
  ) {
    setGuests(
      (current) =>
        current.map(
          (guest) =>
            guest.id ===
            guestId
              ? {
                  ...guest,

                  answers: {
                    ...guest.answers,

                    [questionId]:
                      value,
                  },
                }
              : guest
        )
    );
  }


  /* ==========================================================================
     Validation
  ========================================================================== */

  function validate() {
    const nextErrors:
      Record<
        string,
        GenericGuestErrors
      > =
      {};

    for (
      const guest
      of guests
    ) {
      const guestErrors:
        GenericGuestErrors = {
          answers:
            {},
        };

      if (
        !guest.firstName.trim()
      ) {
        guestErrors.firstName =
          t(
            "validation.firstNameRequired"
          );
      }

      const email =
        guest.email.trim();

      if (
        collectGenericEmail &&
        !email
      ) {
        guestErrors.email =
          t(
            "validation.emailRequired"
          );
      } else if (
        collectGenericEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        guestErrors.email =
          t(
            "validation.emailInvalid"
          );
      }

      for (
        const question
        of rsvp.questions
      ) {
        if (
          !question.required
        ) {
          continue;
        }

        const value =
          guest.answers[
            question.id
          ];

        const isMissing =
          value ===
            undefined ||
          value ===
            null ||
          (
            typeof value ===
              "string" &&
            !value.trim()
          );

        if (
          isMissing
        ) {
          guestErrors.answers[
            question.id
          ] =
            "answer_required";
        }
      }

      if (
        guestErrors.firstName ||
        guestErrors.email ||
        Object.keys(
          guestErrors.answers
        ).length >
          0
      ) {
        nextErrors[
          guest.id
        ] =
          guestErrors;
      }
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length ===
      0
    );
  }


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

    if (
      !validate()
    ) {
      return;
    }

    const submissions:
      GenericInvitationRsvpGuest[] =
      guests.map(
        (guest) => ({
          first_name:
            guest.firstName.trim(),

          last_name:
            guest.lastName.trim() ||
            null,

          email:
            collectGenericEmail
              ? guest.email.trim()
              : null,

          answers:
            guest.answers,
        })
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

      onSuccess();
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
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-generic-rsvp-form"
      data-generic-rsvp-form
    >
      <div
        className="invitation-generic-rsvp-form__guests"
      >
        {guests.map(
          (
            guest,
            index
          ) => {
            const guestErrors =
              errors[
                guest.id
              ];

            return (
              <section
                key={
                  guest.id
                }
                className="invitation-generic-rsvp-form__guest"
              >
                {/* ========================================================
                    Guest Header
                ======================================================== */}

                <div
                  className="invitation-generic-rsvp-form__guest-header"
                >
                  <h2
                    className="invitation-generic-rsvp-form__guest-title"
                  >
                    {t(
                      "guest",
                      {
                        number:
                          index +
                          1,
                      }
                    )}
                  </h2>

                  {index >
                    0 && (
                    <button
                      type="button"
                      className="invitation-generic-rsvp-form__remove"
                      onClick={() =>
                        handleRemoveGuest(
                          guest.id
                        )
                      }
                      aria-label={
                        t(
                          "removeGuest"
                        )
                      }
                    >
                      <Minus
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>


                {/* ========================================================
                    First Name
                ======================================================== */}

                <div
                  className="invitation-generic-rsvp-form__field"
                >
                  <label
                    className="invitation-generic-rsvp-form__label"
                    htmlFor={`generic-rsvp-first-name-${guest.id}`}
                  >
                    {t(
                      "firstName"
                    )}
                  </label>

                  <input
                    id={`generic-rsvp-first-name-${guest.id}`}
                    type="text"
                    className="invitation-generic-rsvp-form__input"
                    value={
                      guest.firstName
                    }
                    onChange={(
                      event
                    ) =>
                      updateGuest(
                        guest.id,
                        {
                          firstName:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    autoComplete={
                      index === 0
                        ? "given-name"
                        : "off"
                    }
                    aria-invalid={
                      Boolean(
                        guestErrors
                          ?.firstName
                      )
                    }
                  />

                  {guestErrors
                    ?.firstName && (
                    <p
                      className="invitation-generic-rsvp-form__error"
                      role="alert"
                    >
                      {
                        guestErrors
                          .firstName
                      }
                    </p>
                  )}
                </div>


                {/* ========================================================
                    Last Name
                ======================================================== */}

                <div
                  className="invitation-generic-rsvp-form__field"
                >
                  <label
                    className="invitation-generic-rsvp-form__label"
                    htmlFor={`generic-rsvp-last-name-${guest.id}`}
                  >
                    {t(
                      "lastName"
                    )}
                  </label>

                  <input
                    id={`generic-rsvp-last-name-${guest.id}`}
                    type="text"
                    className="invitation-generic-rsvp-form__input"
                    value={
                      guest.lastName
                    }
                    onChange={(
                      event
                    ) =>
                      updateGuest(
                        guest.id,
                        {
                          lastName:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    autoComplete={
                      index === 0
                        ? "family-name"
                        : "off"
                    }
                  />
                </div>


                {/* ========================================================
                    Email
                ======================================================== */}

                {collectGenericEmail && (
                  <div
                    className="invitation-generic-rsvp-form__field"
                  >
                    <label
                      className="invitation-generic-rsvp-form__label"
                      htmlFor={`generic-rsvp-email-${guest.id}`}
                    >
                      {t(
                        "email"
                      )}
                    </label>

                    <input
                      id={`generic-rsvp-email-${guest.id}`}
                      type="email"
                      className="invitation-generic-rsvp-form__input"
                      value={
                        guest.email
                      }
                      onChange={(
                        event
                      ) =>
                        updateGuest(
                          guest.id,
                          {
                            email:
                              event
                                .target
                                .value,
                          }
                        )
                      }
                      autoComplete={
                        index === 0
                          ? "email"
                          : "off"
                      }
                      required
                      aria-invalid={
                        Boolean(
                          guestErrors
                            ?.email
                        )
                      }
                    />

                    {guestErrors
                      ?.email && (
                      <p
                        className="invitation-generic-rsvp-form__error"
                        role="alert"
                      >
                        {
                          guestErrors
                            .email
                        }
                      </p>
                    )}
                  </div>
                )}


                {/* ========================================================
                    Questions
                ======================================================== */}

                {rsvp.questions.length >
                  0 && (
                  <div
                    className="invitation-generic-rsvp-form__questions"
                  >
                    {rsvp.questions.map(
                      (question) => (
                        <InvitationRSVPQuestion
                          key={
                            question.id
                          }
                          question={
                            question
                          }
                          value={
                            guest.answers[
                              question.id
                            ] ??
                            null
                          }
                          error={
                            guestErrors
                              ?.answers[
                                question.id
                              ]
                          }
                          disabled={
                            isSubmitting
                          }
                          onChange={(
                            value
                          ) =>
                            handleAnswerChange(
                              guest.id,
                              question.id,
                              value
                            )
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            );
          }
        )}
      </div>


      {/* ==================================================================
          Add Guest
      ================================================================== */}

      {canAddGuest && (
        <button
          type="button"
          className="invitation-generic-rsvp-form__add"
          onClick={
            handleAddGuest
          }
        >
          <Plus
            aria-hidden="true"
          />

          <span>
            {t(
              "addGuest"
            )}
          </span>
        </button>
      )}


      {/* ==================================================================
          Submit Error
      ================================================================== */}

      {submitError && (
        <p
          className="invitation-rsvp-view__submit-error"
          role="alert"
        >
          {submitError}
        </p>
      )}


      {/* ==================================================================
          Submit
      ================================================================== */}

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