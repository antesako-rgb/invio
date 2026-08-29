"use client";

import {
  useEffect,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import {
  Button,
} from "@/components/ui/button";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import styles
  from "./InvitationTemplateUseDialog.module.css";


/* ==========================================================================
   Types
========================================================================== */

type InvitationTemplateUseDialogStep =
  | "action"
  | "existing";

interface InvitationTemplateUseDialogProps {
  open:
    boolean;

  templateName:
    string;

  variantName:
    string;

  invitations:
    Invitation[];

  onOpenChange:
    (open: boolean) => void;

  onApplyExisting:
    (invitationId: string) => void;

  onCreateNew:
    () => void;
}


/* ==========================================================================
   Invitation Template Use Dialog
========================================================================== */

export default function InvitationTemplateUseDialog({
  open,
  templateName,
  variantName,
  invitations,
  onOpenChange,
  onApplyExisting,
  onCreateNew,
}: InvitationTemplateUseDialogProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.templateUseDialog"
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
    useState<InvitationTemplateUseDialogStep>(
      "action"
    );


  /* ==========================================================================
     Reset
  ========================================================================== */

  useEffect(
    () => {
      if (!open) {
        setStep(
          "action"
        );
      }
    },
    [
      open,
    ]
  );


  /* ==========================================================================
     Existing Invitations
  ========================================================================== */

  const sortedInvitations =
    [...invitations].sort(
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
    );


  /* ==========================================================================
     Existing
  ========================================================================== */

  function handleShowExisting() {
    setStep(
      "existing"
    );
  }

  function handleBack() {
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

            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                className={styles.action}
                onClick={
                  handleShowExisting
                }
              >
                <RefreshCw
                  className={styles.actionIcon}
                />

                <span className={styles.actionContent}>
                  <span className={styles.actionTitle}>
                    {t(
                      "existing.title"
                    )}
                  </span>

                  <span className={styles.actionDescription}>
                    {t(
                      "existing.description"
                    )}
                  </span>
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className={styles.action}
                onClick={
                  onCreateNew
                }
              >
                <CopyPlus
                  className={styles.actionIcon}
                />

                <span className={styles.actionContent}>
                  <span className={styles.actionTitle}>
                    {t(
                      "new.title"
                    )}
                  </span>

                  <span className={styles.actionDescription}>
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

            <div className={styles.invitations}>
              {sortedInvitations.map(
                (invitation) => (
                  <Button
                    key={
                      invitation.id
                    }
                    type="button"
                    variant="outline"
                    className={styles.invitation}
                    onClick={() =>
                      onApplyExisting(
                        invitation.id
                      )
                    }
                  >
                    <span className={styles.invitationContent}>
                      <span className={styles.invitationName}>
                        {
                          invitation.name
                        }
                      </span>

                      <span className={styles.invitationTemplate}>
                        {
                          invitation.template_id
                        }

                        {" · "}

                        {
                          invitation.variant_id
                        }
                      </span>

                      <span className={styles.invitationUpdated}>
                        {t(
                          "existing.lastUpdated",
                          {
                            date:
                              format.dateTime(
                                new Date(
                                  invitation.updated_at
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

            <div className={styles.footer}>
              <Button
                type="button"
                variant="ghost"
                onClick={
                  handleBack
                }
              >
                <ArrowLeft
                  className={styles.backIcon}
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