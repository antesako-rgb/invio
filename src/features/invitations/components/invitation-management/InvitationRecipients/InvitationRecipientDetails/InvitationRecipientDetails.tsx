"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import {
  Check,
  Copy,
  Users,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import DeleteButton
  from "@/components/ui/common/DeleteButton";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet/Sheet";

import {
  deleteInvitationRecipientAction,
} from "@/features/invitations/actions/invitation-recipients/deleteInvitationRecipientAction";

import InvitationRecipientGuestDetails
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientDetails/InvitationRecipientGuestDetails/InvitationRecipientGuestDetails";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationRecipientDetails as InvitationRecipientDetailsType,
} from "@/features/invitations/types/invitationRecipient.types";

import {
  getInvitationPublicPath,
} from "@/features/invitations/utils/getInvitationPublicPath";

import styles
  from "./InvitationRecipientDetails.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientDetailsProps {
  recipient:
    InvitationRecipientDetailsType;

  questions:
    InvitationRsvpQuestion[];

  selectedGuestId?:
    string;

  open:
    boolean;

  onOpenChange:
    (open: boolean) => void;
}


/* ==========================================================================
   Invitation Recipient Details
========================================================================== */

export default function InvitationRecipientDetails({
  recipient,
  questions,
  selectedGuestId,
  open,
  onOpenChange,
}: InvitationRecipientDetailsProps) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    origin,
    setOrigin,
  ] =
    useState("");

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);


  /* ==========================================================================
     Origin
  ========================================================================== */

  useEffect(
    () => {
      setOrigin(
        window.location.origin
      );
    },
    []
  );


  /* ==========================================================================
     Primary Recipient
  ========================================================================== */

  const primaryGuest =
    recipient.guests.find(
      (guest) =>
        guest.is_primary_recipient
    ) ??
    recipient.guests[0] ??
    null;


  /* ==========================================================================
     Selected Guest
  ========================================================================== */

  const selectedGuest =
    selectedGuestId
      ? recipient.guests.find(
          (guest) =>
            guest.id ===
            selectedGuestId
        ) ??
        null
      : null;

  const focusedGuest =
    selectedGuest ??
    primaryGuest;

  const focusedGuestName =
    focusedGuest
      ? [
          focusedGuest.first_name,
          focusedGuest.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : "—";

  const primaryGuestName =
    primaryGuest
      ? [
          primaryGuest.first_name,
          primaryGuest.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : "—";


  /* ==========================================================================
     Personalized Link
  ========================================================================== */

  const personalizedPath =
    getInvitationPublicPath(
      recipient.public_id
    );

  const personalizedUrl =
    origin
      ? `${origin}${personalizedPath}`
      : personalizedPath;


  /* ==========================================================================
     Copy Link
  ========================================================================== */

  async function handleCopyLink() {
    try {
      const url =
        `${window.location.origin}${personalizedPath}`;

      await navigator.clipboard.writeText(
        url
      );

      setCopied(
        true
      );

      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        2000
      );
    } catch {
      setCopied(
        false
      );
    }
  }


  /* ==========================================================================
     Delete Recipient
  ========================================================================== */

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(
      true
    );

    try {
      const result =
        await deleteInvitationRecipientAction({
          p_recipient_id:
            recipient.id,
        });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      toast.success(
        t(
          "details.delete.success"
        )
      );

      onOpenChange(
        false
      );

      router.refresh();
    } finally {
      setIsDeleting(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Sheet
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <SheetContent
        side="right"
      >
        <SheetHeader>
          <SheetTitle>
            {focusedGuestName}
          </SheetTitle>

          <SheetDescription>
            {t(
              "details.description"
            )}
          </SheetDescription>
        </SheetHeader>


        <div
          className={
            styles.content
          }
        >
          {/* ================================================================
              Recipient
          ================================================================ */}

          <div
            className={
              styles.recipient
            }
          >
            <div
              className={
                styles.icon
              }
            >
              <Users
                className="size-5"
                aria-hidden="true"
              />
            </div>

            <div
              className={
                styles.recipientContent
              }
            >
              <strong>
                {primaryGuestName}
              </strong>

              <span>
                {t(
                  "guestCount",
                  {
                    count:
                      recipient.guests.length,
                  }
                )}
              </span>
            </div>
          </div>


          {/* ================================================================
              Personalized Link
          ================================================================ */}

          <div
            className={
              styles.section
            }
          >
            <span
              className={
                styles.label
              }
            >
              {t(
                "details.link.title"
              )}
            </span>

            <div
              className={
                styles.link
              }
            >
              <span
                title={
                  personalizedUrl
                }
              >
                {personalizedUrl}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  copied
                    ? t(
                        "details.link.copied"
                      )
                    : t(
                        "details.link.copy"
                      )
                }
                title={
                  copied
                    ? t(
                        "details.link.copied"
                      )
                    : t(
                        "details.link.copy"
                      )
                }
                onClick={
                  handleCopyLink
                }
              >
                {copied ? (
                  <Check
                    className="size-4"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy
                    className="size-4"
                    aria-hidden="true"
                  />
                )}
              </Button>
            </div>
          </div>


          {/* ================================================================
              Guests
          ================================================================ */}

          <div
            className={
              styles.section
            }
          >
            <span
              className={
                styles.label
              }
            >
              {t(
                "details.guests.title"
              )}
            </span>

            <InvitationRecipientGuestDetails
              guests={
                recipient.guests
              }
              questions={
                questions
              }
              selectedGuestId={
                selectedGuestId
              }
            />
          </div>


          {/* ================================================================
              Danger Zone
          ================================================================ */}

          <div
            className={
              styles.dangerZone
            }
          >
            <div
              className={
                styles.dangerContent
              }
            >
              <strong>
                {t(
                  "details.danger.title"
                )}
              </strong>

              <span>
                {t(
                  "details.danger.description"
                )}
              </span>
            </div>

            <DeleteButton
              title={
                t(
                  "details.delete.title"
                )
              }
              description={
                t(
                  "details.delete.description"
                )
              }
              confirmText={
                t(
                  "details.delete.confirm"
                )
              }
              loading={
                isDeleting
              }
              onDelete={
                handleDelete
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}