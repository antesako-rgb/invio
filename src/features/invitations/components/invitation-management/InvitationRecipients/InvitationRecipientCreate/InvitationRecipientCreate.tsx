"use client";

import {
  useState,
} from "react";

import {
  Plus,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet/Sheet";

import Stepper
  from "@/components/ui/stepper/Stepper";

import InvitationRecipientGuestStep
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientCreate/InvitationRecipientGuestStep/InvitationRecipientGuestStep";

import InvitationRecipientReviewStep
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientCreate/InvitationRecipientReviewStep/InvitationRecipientReviewStep";

import InvitationRecipientSettingsStep
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientCreate/InvitationRecipientSettingsStep/InvitationRecipientSettingsStep";

import {
  useInvitationRecipientCreate,
} from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientCreate/hooks/useInvitationRecipientCreate";

import type {
  EventGuest,
  GuestGroup,
} from "@/features/guests/types/guest.types";

import styles
  from "./InvitationRecipientCreate.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientCreateProps {
  invitationId:
    string;

  guests:
    EventGuest[];

  groups:
    GuestGroup[];
}


/* ==========================================================================
   Invitation Recipient Create
========================================================================== */

export default function InvitationRecipientCreate({
  invitationId,
  guests,
  groups,
}: InvitationRecipientCreateProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.create"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    open,
    setOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Create
  ========================================================================== */

  const {
    step,
    selectedGuestIds,
    primaryGuestId,
    isSubmitting,
    submitError,

    setPrimaryGuestId,

    reset,

    handleGuestSelectionChange,
    handleGuestContinue,
    handleSettingsContinue,
    handleSettingsBack,
    handleReviewBack,
    handleSubmit,
  } =
    useInvitationRecipientCreate({
      invitationId,

      onSuccess:
        () =>
          setOpen(
            false
          ),
    });


  /* ==========================================================================
     Step
  ========================================================================== */

  const hasSingleGuest =
    selectedGuestIds.length === 1;

  const steps =
    hasSingleGuest &&
    step === "review"
      ? [
          {
            label:
              t(
                "steps.guests"
              ),
            active:
              false,
            completed:
              true,
          },
          {
            label:
              t(
                "steps.review"
              ),
            active:
              true,
          },
        ]
      : [
          {
            label:
              t(
                "steps.guests"
              ),
            active:
              step === "guests",
            completed:
              step !== "guests",
          },
          {
            label:
              t(
                "steps.settings"
              ),
            active:
              step === "settings",
            completed:
              step === "review",
          },
          {
            label:
              t(
                "steps.review"
              ),
            active:
              step === "review",
          },
        ];


  /* ==========================================================================
     Open
  ========================================================================== */

  function handleOpen() {
    reset();

    setOpen(
      true
    );
  }


  /* ==========================================================================
     Open Change
  ========================================================================== */

  function handleOpenChange(
    nextOpen: boolean
  ) {
    if (
      isSubmitting &&
      !nextOpen
    ) {
      return;
    }

    setOpen(
      nextOpen
    );

    if (!nextOpen) {
      reset();
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <Button
        type="button"
        onClick={
          handleOpen
        }
      >
        <Plus
          className="size-4"
          aria-hidden="true"
        />

        {t(
          "action"
        )}
      </Button>


      <Sheet
        open={
          open
        }
        onOpenChange={
          handleOpenChange
        }
      >
        <SheetContent
          side="right"
        >
          <SheetHeader>
            <SheetTitle>
              {t(
                "title"
              )}
            </SheetTitle>

            <SheetDescription>
              {t(
                "description"
              )}
            </SheetDescription>
          </SheetHeader>


          <div
            className={
              styles.content
            }
          >
            <Stepper
              steps={
                steps
              }
            />


            {/* ==============================================================
                Guests
            ============================================================== */}

            {step === "guests" && (
              <>
                <InvitationRecipientGuestStep
                  guests={
                    guests
                  }
                  groups={
                    groups
                  }
                  selectedGuestIds={
                    selectedGuestIds
                  }
                  onSelectionChange={
                    handleGuestSelectionChange
                  }
                />

                <div
                  className={
                    styles.stepContent
                  }
                >
                  <Button
                    type="button"
                    disabled={
                      selectedGuestIds.length ===
                      0
                    }
                    onClick={
                      handleGuestContinue
                    }
                  >
                    {t(
                      "next"
                    )}
                  </Button>
                </div>
              </>
            )}


            {/* ==============================================================
                Settings
            ============================================================== */}

            {step === "settings" && (
              <>
                <InvitationRecipientSettingsStep
                  guests={
                    guests
                  }
                  selectedGuestIds={
                    selectedGuestIds
                  }
                  primaryGuestId={
                    primaryGuestId
                  }
                  onPrimaryGuestChange={
                    setPrimaryGuestId
                  }
                />

                <div
                  className={
                    styles.stepContent
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handleSettingsBack
                    }
                  >
                    {t(
                      "back"
                    )}
                  </Button>

                  <Button
                    type="button"
                    disabled={
                      !primaryGuestId
                    }
                    onClick={
                      handleSettingsContinue
                    }
                  >
                    {t(
                      "next"
                    )}
                  </Button>
                </div>
              </>
            )}


            {/* ==============================================================
                Review
            ============================================================== */}

            {step === "review" &&
              primaryGuestId && (
                <>
                  <InvitationRecipientReviewStep
                    guests={
                      guests
                    }
                    selectedGuestIds={
                      selectedGuestIds
                    }
                    primaryGuestId={
                      primaryGuestId
                    }
                  />

                  {submitError && (
                    <p
                      className={
                        styles.error
                      }
                    >
                      {submitError}
                    </p>
                  )}

                  <div
                    className={
                      styles.stepContent
                    }
                  >
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        isSubmitting
                      }
                      onClick={
                        handleReviewBack
                      }
                    >
                      {t(
                        "back"
                      )}
                    </Button>

                    <Button
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      onClick={
                        handleSubmit
                      }
                    >
                      {isSubmitting
                        ? t(
                            "submitting"
                          )
                        : t(
                            "submit"
                          )}
                    </Button>
                  </div>
                </>
              )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}