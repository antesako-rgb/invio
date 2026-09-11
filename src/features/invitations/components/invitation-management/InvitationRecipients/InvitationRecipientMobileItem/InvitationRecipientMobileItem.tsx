"use client";

import {
  CalendarDays,
  Check,
  Copy,
  MoreHorizontal,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import Avatar
  from "@/components/ui/avatar/Avatar";

import {
  Button,
} from "@/components/ui/button";

import InvitationRecipientDetails
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientDetails/InvitationRecipientDetails";

import InvitationRsvpStatusBadge
  from "@/features/invitations/components/invitation-management/InvitationRsvpStatusBadge/InvitationRsvpStatusBadge";

import type {
  InvitationManagementRow,
} from "@/features/invitations/types/invitationManagement.types";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationRsvp.types";

import {
  getEventExperiencePublicPath,
} from "@/features/invitations/utils/getEventExperiencePublicPath";

import {
  getInitials,
} from "@/lib/utils/getInitials";

import styles
  from "./InvitationRecipientMobileItem.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientMobileItemProps {
  invitationPublicId:
    string;

  row:
    InvitationManagementRow;

  questions:
    InvitationRsvpQuestion[];
}


/* ==========================================================================
   Invitation Recipient Mobile Item
========================================================================== */

export default function InvitationRecipientMobileItem({
  invitationPublicId,
  row,
  questions,
}: InvitationRecipientMobileItemProps) {
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
    detailsOpen,
    setDetailsOpen,
  ] =
    useState(false);

  const [
    copied,
    setCopied,
  ] =
    useState(false);


  /* ==========================================================================
     Invitation Link
  ========================================================================== */

  const isPersonalized =
    row.public_id !==
    null;

  const invitationPath =
    getEventExperiencePublicPath(
      row.public_id ??
        invitationPublicId
    );


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

  const primaryGuestInitials =
    getInitials(
      primaryGuestName
    );


  /* ==========================================================================
     RSVP
  ========================================================================== */

  const attendingCount =
    row.guests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "attending"
    ).length;

  const declinedCount =
    row.guests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "declined"
    ).length;

  const pendingCount =
    row.guests.length -
    attendingCount -
    declinedCount;


  /* ==========================================================================
     Updated
  ========================================================================== */

  const updatedAt =
    new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle:
          "medium",
      }
    ).format(
      new Date(
        row.updated_at
      )
    );


  /* ==========================================================================
     Open Details
  ========================================================================== */

  function handleOpenDetails() {
    setDetailsOpen(
      true
    );
  }


  /* ==========================================================================
     Open Invitation
  ========================================================================== */

  function handleOpenInvitation() {
    window.open(
      invitationPath,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* ==========================================================================
     Copy Link
  ========================================================================== */

  async function handleCopyLink() {
    try {
      const invitationUrl =
        `${window.location.origin}${invitationPath}`;

      await navigator.clipboard.writeText(
        invitationUrl
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
     Render
  ========================================================================== */

  return (
    <>
      <article
        className={
          styles.card
        }
      >
        {/* ==================================================================
            Header
        ================================================================== */}

        <div
          className={
            styles.header
          }
        >
          <button
            type="button"
            className={
              styles.recipient
            }
            onClick={
              handleOpenDetails
            }
          >
            <Avatar
              alt={
                primaryGuestName
              }
              fallback={
                primaryGuestInitials
              }
              size="sm"
            />

            <span
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
            </span>
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              t(
                "actions.open"
              )
            }
            onClick={
              handleOpenDetails
            }
          >
            <MoreHorizontal
              className="size-4"
              aria-hidden="true"
            />
          </Button>
        </div>


        {/* ==================================================================
            Link
        ================================================================== */}

        <div
          className={
            styles.linkRow
          }
        >
          <button
            type="button"
            className={
              styles.link
            }
            onClick={
              handleOpenInvitation
            }
          >
            {isPersonalized
              ? invitationPath
              : t(
                  "table.publicInvitation"
                )}
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={
              styles.copyButton
            }
            aria-label={
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
                className="size-4 text-green-600"
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


        {/* ==================================================================
            Guests
        ================================================================== */}

        <div
          className={
            styles.guests
          }
        >
          {row.guests
            .map(
              (guest) =>
                [
                  guest.first_name,
                  guest.last_name,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " "
                  )
            )
            .join(
              ", "
            )}
        </div>


        {/* ==================================================================
            Footer
        ================================================================== */}

        <div
          className={
            styles.footer
          }
        >
          <div
            className={
              styles.rsvp
            }
          >
            {attendingCount >
              0 && (
              <InvitationRsvpStatusBadge
                status="attending"
                count={
                  attendingCount
                }
              />
            )}

            {declinedCount >
              0 && (
              <InvitationRsvpStatusBadge
                status="declined"
                count={
                  declinedCount
                }
              />
            )}

            {pendingCount >
              0 && (
              <InvitationRsvpStatusBadge
                status="pending"
                count={
                  pendingCount
                }
              />
            )}
          </div>

          <div
            className={
              styles.updated
            }
          >
            <CalendarDays
              className="size-4"
              aria-hidden="true"
            />

            <span>
              {updatedAt}
            </span>
          </div>
        </div>
      </article>


      {/* ====================================================================
          Details
      ==================================================================== */}

      <InvitationRecipientDetails
        row={
          row
        }
        questions={
          questions
        }
        open={
          detailsOpen
        }
        onOpenChange={
          setDetailsOpen
        }
      />
    </>
  );
}