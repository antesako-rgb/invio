"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useFormatter,
  useTranslations,
} from "next-intl";

import {
  ArrowLeft,
  CopyPlus,
  RefreshCw,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import styles
  from "./EventExperienceTemplateUseDialog.module.css";


/* ==========================================================================
   Types
========================================================================== */

type EventExperienceTemplateUseDialogStep =
  | "action"
  | "existing";

interface EventExperienceTemplateUseDialogProps {
  open:
    boolean;

  templateName:
    string;

  variantName:
    string;

  experiences:
    EventExperience[];

  disabled?:
    boolean;

  onOpenChange:
    (
      open: boolean
    ) => void;

  onApplyExisting:
    (
      experienceId: string
    ) => void;

  onCreateNew:
    () => void;
}


/* ==========================================================================
   Event Experience Template Use Dialog
========================================================================== */

export default function EventExperienceTemplateUseDialog({
  open,
  templateName,
  variantName,
  experiences,
  disabled = false,
  onOpenChange,
  onApplyExisting,
  onCreateNew,
}: EventExperienceTemplateUseDialogProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

const t =
  useTranslations(
    "EventExperienceTemplates.useDialog"
  );

  const format =
    useFormatter();


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    step,
    setStep,
  ] =
    useState<EventExperienceTemplateUseDialogStep>(
      "action"
    );


  /* ==========================================================================
     Existing Experiences
  ========================================================================== */

  const sortedExperiences =
    useMemo(
      () =>
        [...experiences].sort(
          (
            first,
            second
          ) =>
            new Date(
              second.updated_at
            ).getTime() -
            new Date(
              first.updated_at
            ).getTime()
        ),
      [
        experiences,
      ]
    );

  const hasExistingExperiences =
    sortedExperiences.length > 0;


  /* ==========================================================================
     Reset
  ========================================================================== */

  useEffect(
    () => {
      if (!open) {
        setStep(
          "action"
        );

        return;
      }

      if (
        step === "existing" &&
        !hasExistingExperiences
      ) {
        setStep(
          "action"
        );
      }
    },
    [
      open,
      step,
      hasExistingExperiences,
    ]
  );


  /* ==========================================================================
     Existing
  ========================================================================== */

  function handleShowExisting() {
    if (
      disabled ||
      !hasExistingExperiences
    ) {
      return;
    }

    setStep(
      "existing"
    );
  }

  function handleBack() {
    if (disabled) {
      return;
    }

    setStep(
      "action"
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent>
        {step === "action" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "title"
                )}
              </DialogTitle>

              <DialogDescription>
                {t(
                  "description",
                  {
                    template:
                      templateName,

                    variant:
                      variantName,
                  }
                )}
              </DialogDescription>
            </DialogHeader>

            <div
              className={
                styles.actions
              }
            >
              {hasExistingExperiences && (
                <Button
                  type="button"
                  variant="outline"
                  className={
                    styles.action
                  }
                  disabled={
                    disabled
                  }
                  onClick={
                    handleShowExisting
                  }
                >
                  <RefreshCw
                    className={
                      styles.actionIcon
                    }
                  />

                  <span
                    className={
                      styles.actionContent
                    }
                  >
                    <span
                      className={
                        styles.actionTitle
                      }
                    >
                      {t(
                        "existing.title"
                      )}
                    </span>

                    <span
                      className={
                        styles.actionDescription
                      }
                    >
                      {t(
                        "existing.description"
                      )}
                    </span>
                  </span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                className={
                  styles.action
                }
                disabled={
                  disabled
                }
                onClick={
                  onCreateNew
                }
              >
                <CopyPlus
                  className={
                    styles.actionIcon
                  }
                />

                <span
                  className={
                    styles.actionContent
                  }
                >
                  <span
                    className={
                      styles.actionTitle
                    }
                  >
                    {t(
                      "new.title"
                    )}
                  </span>

                  <span
                    className={
                      styles.actionDescription
                    }
                  >
                    {t(
                      "new.description"
                    )}
                  </span>
                </span>
              </Button>
            </div>
          </>
        )}

        {step === "existing" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "existing.selectTitle"
                )}
              </DialogTitle>

              <DialogDescription>
                {t(
                  "existing.selectDescription"
                )}
              </DialogDescription>
            </DialogHeader>

            <div
              className={
                styles.experiences
              }
            >
              {sortedExperiences.map(
                (experience) => (
                  <Button
                    key={
                      experience.id
                    }
                    type="button"
                    variant="outline"
                    className={
                      styles.experience
                    }
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      onApplyExisting(
                        experience.id
                      )
                    }
                  >
                    <span
                      className={
                        styles.experienceContent
                      }
                    >
                      <span
                        className={
                          styles.experienceName
                        }
                      >
                        {
                          experience.name
                        }
                      </span>

                      <span
                        className={
                          styles.experienceDate
                        }
                      >
                        {t(
                         "existing.lastUpdated",
                          {
                            date:
                              format.dateTime(
                                new Date(
                                  experience.updated_at
                                ),
                                {
                                  day:
                                    "2-digit",

                                  month:
                                    "2-digit",

                                  year:
                                    "numeric",

                                  hour:
                                    "2-digit",

                                  minute:
                                    "2-digit",
                                }
                              ),
                          }
                        )}
                      </span>
                    </span>
                  </Button>
                )
              )}
            </div>

            <div
              className={
                styles.footer
              }
            >
              <Button
                type="button"
                variant="ghost"
                disabled={
                  disabled
                }
                onClick={
                  handleBack
                }
              >
                <ArrowLeft
                  className={
                    styles.backIcon
                  }
                />

                {t(
                  "back"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}