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
  InvitationManagementRow,
} from "@/features/invitations/types/invitationManagement.types";

import {
  getInvitationPublicPath,
} from "@/features/invitations/utils/getInvitationPublicPath";

import styles
  from "./InvitationRecipientDetails.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientDetailsProps {
  row:
    InvitationManagementRow;

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
  row,
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
     Personalized
  ========================================================================== */

  const isPersonalized =
    row.recipient_id !==
      null &&
    row.public_id !==
      null;


  /* ==========================================================================
     Primary Guest
  ========================================================================== */

  const primaryGuest =
    row.guests.find(
      (guest) =>
        guest.is_primary_recipient
    ) ??
    row.guests[0] ??
    null;


  /* ==========================================================================
     Selected Guest
  ========================================================================== */

  const selectedGuest =
    selectedGuestId
      ? row.guests.find(
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
          .filter(
            Boolean
          )
          .join(
            " "
          )
      : "—";

  const primaryGuestName =
    primaryGuest
      ? [
          primaryGuest.first_name,
          primaryGuest.last_name,
        ]
          .filter(
            Boolean
          )
          .join(
            " "
          )
      : "—";


  /* ==========================================================================
     Personalized Link
  ========================================================================== */

  const personalizedPath =
    row.public_id
      ? getInvitationPublicPath(
          row.public_id
        )
      : null;

  const personalizedUrl =
    personalizedPath
      ? origin
        ? `${origin}${personalizedPath}`
        : personalizedPath
      : null;


  /* ==========================================================================
     Copy Link
  ========================================================================== */

  async function handleCopyLink() {
    if (
      !personalizedPath
    ) {
      return;
    }

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
    if (
      isDeleting ||
      !row.recipient_id
    ) {
      return;
    }

    setIsDeleting(
      true
    );

    try {
      const result =
        await deleteInvitationRecipientAction({
          p_recipient_id:
            row.recipient_id,
        });

      if (
        !result.success
      ) {
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
                      row.guests.length,
                  }
                )}
              </span>
            </div>
          </div>


          {/* ================================================================
              Link
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

            {personalizedUrl ? (
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
            ) : (
              <div
                className={
                  styles.link
                }
              >
                <span>
                  {t(
                    "table.publicInvitation"
                  )}
                </span>
              </div>
            )}
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
                row.guests
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

          {isPersonalized && (
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}