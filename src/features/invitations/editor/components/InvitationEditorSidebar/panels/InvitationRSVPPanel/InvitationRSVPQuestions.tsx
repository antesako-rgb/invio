"use client";

import {
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Field,
} from "@/components/ui/field";

import {
  Input,
} from "@/components/ui/input";

import {
  Section,
} from "@/components/ui/section";

import {
  Select,
} from "@/components/ui/select";

import {
  SwitchField,
} from "@/components/ui/switch";

import type {
  InvitationRsvpContent,
  InvitationRsvpQuestion,
  InvitationRsvpQuestionOption,
  InvitationRsvpQuestionType,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPQuestionsProps {
  rsvp:
    InvitationRsvpContent;

  onChange:
    (
      rsvp: InvitationRsvpContent
    ) => void;
}


/* ==========================================================================
   Question Helpers
========================================================================== */

function createQuestion():
  InvitationRsvpQuestion {
  return {
    id:
      crypto.randomUUID(),

    type:
      "text",

    label:
      "",

    required:
      false,

    options:
      [],
  };
}


function createQuestionOption():
  InvitationRsvpQuestionOption {
  return {
    id:
      crypto.randomUUID(),

    label:
      "",
  };
}


/* ==========================================================================
   Invitation RSVP Questions
========================================================================== */

export default function InvitationRSVPQuestions({
  rsvp,
  onChange,
}: InvitationRSVPQuestionsProps) {
  const t =
    useTranslations(
      "Invitations.editor.rsvp.questions"
    );

  const isEnabled =
    rsvp.enabled ??
    true;

  const questions =
    rsvp.questions ??
    [];

  const questionTypeOptions = [
    {
      value:
        "text",

      label:
        t(
          "types.text"
        ),
    },

    {
      value:
        "textarea",

      label:
        t(
          "types.textarea"
        ),
    },

    {
      value:
        "single_choice",

      label:
        t(
          "types.singleChoice"
        ),
    },

    {
      value:
        "yes_no",

      label:
        t(
          "types.yesNo"
        ),
    },
  ] as const;


  /* ==========================================================================
     Questions Change
  ========================================================================== */

  function handleQuestionsChange(
    nextQuestions:
      InvitationRsvpQuestion[]
  ) {
    onChange({
      ...rsvp,

      questions:
        nextQuestions,
    });
  }


  /* ==========================================================================
     Add Question
  ========================================================================== */

  function handleAddQuestion() {
    handleQuestionsChange([
      ...questions,

      createQuestion(),
    ]);
  }


  /* ==========================================================================
     Update Question
  ========================================================================== */

  function handleUpdateQuestion(
    questionId:
      string,
    updates:
      Partial<InvitationRsvpQuestion>
  ) {
    handleQuestionsChange(
      questions.map(
        (question) =>
          question.id ===
          questionId
            ? {
                ...question,
                ...updates,
              }
            : question
      )
    );
  }


  /* ==========================================================================
     Label
  ========================================================================== */

  function handleLabelChange(
    questionId:
      string,
    label:
      string
  ) {
    handleUpdateQuestion(
      questionId,
      {
        label,
      }
    );
  }


  /* ==========================================================================
     Type
  ========================================================================== */

  function handleTypeChange(
    questionId:
      string,
    type:
      string
  ) {
    const nextType =
      type as
        InvitationRsvpQuestionType;

    const question =
      questions.find(
        (item) =>
          item.id ===
          questionId
      );

    if (!question) {
      return;
    }

    const options =
      nextType ===
      "single_choice"
        ? question.options.length > 0
          ? question.options
          : [
              createQuestionOption(),
              createQuestionOption(),
            ]
        : [];

    handleUpdateQuestion(
      questionId,
      {
        type:
          nextType,

        options,
      }
    );
  }


  /* ==========================================================================
     Required
  ========================================================================== */

  function handleRequiredChange(
    questionId:
      string,
    required:
      boolean
  ) {
    handleUpdateQuestion(
      questionId,
      {
        required,
      }
    );
  }


  /* ==========================================================================
     Add Option
  ========================================================================== */

  function handleAddOption(
    questionId:
      string
  ) {
    const question =
      questions.find(
        (item) =>
          item.id ===
          questionId
      );

    if (!question) {
      return;
    }

    handleUpdateQuestion(
      questionId,
      {
        options: [
          ...question.options,

          createQuestionOption(),
        ],
      }
    );
  }


  /* ==========================================================================
     Option Label
  ========================================================================== */

  function handleOptionLabelChange(
    questionId:
      string,
    optionId:
      string,
    label:
      string
  ) {
    const question =
      questions.find(
        (item) =>
          item.id ===
          questionId
      );

    if (!question) {
      return;
    }

    handleUpdateQuestion(
      questionId,
      {
        options:
          question.options.map(
            (option) =>
              option.id ===
              optionId
                ? {
                    ...option,

                    label,
                  }
                : option
          ),
      }
    );
  }


  /* ==========================================================================
     Remove Option
  ========================================================================== */
function handleRemoveOption(
  questionId:
    string,
  optionId:
    string
) {
  const question =
    questions.find(
      (item) =>
        item.id ===
        questionId
    );

  if (
    !question ||
    question.options.length <= 2
  ) {
    return;
  }

  handleUpdateQuestion(
    questionId,
    {
      options:
        question.options.filter(
          (option) =>
            option.id !==
            optionId
        ),
    }
  );
}


  /* ==========================================================================
     Remove Question
  ========================================================================== */

  function handleRemoveQuestion(
    questionId:
      string
  ) {
    handleQuestionsChange(
      questions.filter(
        (question) =>
          question.id !==
          questionId
      )
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="flex flex-col gap-10"
      data-invitation-rsvp-questions
    >
      <Section
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
        icon={
          ListChecks
        }
      >
        {/* ==================================================================
            Add Question
        ================================================================== */}

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={
              !isEnabled
            }
            onClick={
              handleAddQuestion
            }
          >
            <Plus
              aria-hidden="true"
            />

            {t(
              "add"
            )}
          </Button>
        </div>


        {/* ==================================================================
            Empty
        ================================================================== */}

        {questions.length ===
        0 ? (
          <div
            className="rounded-xl border border-dashed border-border p-5 text-center"
            data-invitation-rsvp-questions-empty
          >
            <p className="text-sm font-medium text-foreground">
              {t(
                "empty.title"
              )}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t(
                "empty.description"
              )}
            </p>
          </div>
        ) : (
          /* ==============================================================
             Questions
          ============================================================== */

          <div className="flex flex-col gap-4">
            {questions.map(
              (
                question,
                index
              ) => (
                <div
                  key={
                    question.id
                  }
                  className="flex flex-col gap-5 rounded-xl border border-border p-4"
                  data-invitation-rsvp-question
                >
                  {/* ======================================================
                      Header
                  ====================================================== */}

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t(
                        "question.number",
                        {
                          number:
                            index +
                            1,
                        }
                      )}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={
                        !isEnabled
                      }
                      aria-label={
                        t(
                          "remove"
                        )
                      }
                      onClick={
                        () =>
                          handleRemoveQuestion(
                            question.id
                          )
                      }
                    >
                      <Trash2
                        aria-hidden="true"
                      />
                    </Button>
                  </div>


                  {/* ======================================================
                      Label
                  ====================================================== */}

                  <Field
                    id={`invitation-rsvp-question-${question.id}-label`}
                    size="sm"
                    label={
                      t(
                        "question.label"
                      )
                    }
                  >
                    <Input
                      value={
                        question.label
                      }
                      placeholder={
                        t(
                          "question.placeholder"
                        )
                      }
                      disabled={
                        !isEnabled
                      }
                      onChange={
                        (event) =>
                          handleLabelChange(
                            question.id,
                            event.target.value
                          )
                      }
                    />
                  </Field>


                  {/* ======================================================
                      Type
                  ====================================================== */}

                  <Field
                    id={`invitation-rsvp-question-${question.id}-type`}
                    size="sm"
                    label={
                      t(
                        "question.type"
                      )
                    }
                  >
                    <Select
                      value={
                        question.type
                      }
                      options={
                        questionTypeOptions
                      }
                      disabled={
                        !isEnabled
                      }
                      onValueChange={
                        (value) =>
                          handleTypeChange(
                            question.id,
                            value
                          )
                      }
                    />
                  </Field>


                  {/* ======================================================
                      Single Choice Options
                  ====================================================== */}

                  {question.type ===
                    "single_choice" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-foreground">
                          {t(
                            "options.label"
                          )}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={
                            !isEnabled
                          }
                          onClick={
                            () =>
                              handleAddOption(
                                question.id
                              )
                          }
                        >
                          <Plus
                            aria-hidden="true"
                          />

                          {t(
                            "options.add"
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {question.options.map(
                          (
                            option,
                            optionIndex
                          ) => (
                            <div
                              key={
                                option.id
                              }
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={
                                  option.label
                                }
                                placeholder={
                                  t(
                                    "options.placeholder",
                                    {
                                      number:
                                        optionIndex +
                                        1,
                                    }
                                  )
                                }
                                disabled={
                                  !isEnabled
                                }
                                onChange={
                                  (event) =>
                                    handleOptionLabelChange(
                                      question.id,
                                      option.id,
                                      event.target.value
                                    )
                                }
                              />

<Button
  type="button"
  variant="ghost"
  size="icon"
  className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
  disabled={
    !isEnabled ||
    question.options.length <= 2
  }
  aria-label={
    t(
      "options.remove"
    )
  }
  onClick={
    () =>
      handleRemoveOption(
        question.id,
        option.id
      )
  }
>
  <Trash2
    aria-hidden="true"
  />
</Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}


                  {/* ======================================================
                      Required
                  ====================================================== */}

                  <SwitchField
                    id={`invitation-rsvp-question-${question.id}-required`}
                    label={
                      t(
                        "question.required.label"
                      )
                    }
                    description={
                      t(
                        "question.required.description"
                      )
                    }
                    checked={
                      question.required
                    }
                    disabled={
                      !isEnabled
                    }
                    onCheckedChange={
                      (required) =>
                        handleRequiredChange(
                          question.id,
                          required
                        )
                    }
                  />
                </div>
              )
            )}
          </div>
        )}
      </Section>
    </div>
  );
}