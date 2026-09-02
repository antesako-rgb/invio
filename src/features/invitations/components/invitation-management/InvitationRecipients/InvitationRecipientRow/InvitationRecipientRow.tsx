"use client";

import {
  useState,
} from "react";
import {
  getInitials,
} from "@/lib/utils/getInitials";
import {
  CalendarDays,
  Check,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";
import {
  useTranslations,
} from "next-intl";

import Avatar
  from "@/components/ui/avatar/Avatar";

import {
  Button,
} from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/data-table";

import InvitationRecipientDetails
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientDetails/InvitationRecipientDetails";

import InvitationRsvpStatusBadge
  from "@/features/invitations/components/invitation-management/InvitationRsvpStatusBadge/InvitationRsvpStatusBadge";

import type {
  InvitationRecipientDetails as InvitationRecipientDetailsType,
} from "@/features/invitations/types/invitationRecipient.types";

import {
  getInvitationPublicPath,
} from "@/features/invitations/utils/getInvitationPublicPath";

import styles
  from "./InvitationRecipientRow.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientRowProps {
  recipient:
    InvitationRecipientDetailsType;
}


/* ==========================================================================
   Constants
========================================================================== */

const VISIBLE_GUESTS =
  2;


/* ==========================================================================
   Invitation Recipient Row
========================================================================== */

export default function InvitationRecipientRow({
  recipient,
}: InvitationRecipientRowProps) {
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
     Primary Recipient
  ========================================================================== */

  const primaryGuest =
    recipient.guests.find(
      (guest) =>
        guest.is_primary_recipient
    ) ??
    recipient.guests[0] ??
    null;

  const primaryGuestName =
    primaryGuest
      ? [
          primaryGuest.first_name,
          primaryGuest.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : "—";

const primaryGuestInitials =
  getInitials(
    primaryGuestName
  );


  /* ==========================================================================
     Personalized Link
  ========================================================================== */

  const personalizedPath =
    getInvitationPublicPath(
      recipient.public_id
    );


  /* ==========================================================================
     Guests
  ========================================================================== */

  const visibleGuests =
    recipient.guests.slice(
      0,
      VISIBLE_GUESTS
    );

  const remainingGuestCount =
    Math.max(
      recipient.guests.length -
        VISIBLE_GUESTS,
      0
    );


  /* ==========================================================================
     RSVP
  ========================================================================== */

  const attendingCount =
    recipient.guests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "attending"
    ).length;

  const declinedCount =
    recipient.guests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "declined"
    ).length;

  const pendingCount =
    recipient.guests.length -
    attendingCount -
    declinedCount;

  const hasSingleRsvpStatus =
    [
      attendingCount,
      declinedCount,
      pendingCount,
    ].filter(
      (count) =>
        count > 0
    ).length === 1;


  /* ==========================================================================
     Updated At
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
        recipient.updated_at
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
      personalizedPath,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* ==========================================================================
     Copy Link
  ========================================================================== */

  async function handleCopyLink() {
    try {
      const personalizedUrl =
        `${window.location.origin}${personalizedPath}`;

      await navigator.clipboard.writeText(
        personalizedUrl
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
      <TableRow
        className={
          styles.row
        }
      >
        {/* ====================================================================
            Recipient
        ==================================================================== */}

        <TableCell
          className={
            styles.recipient
          }
        >
          <button
            type="button"
            className={
              styles.recipientTrigger
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
              <span
                className={
                  styles.recipientName
                }
              >
                {primaryGuestName}
              </span>

              <span
                className={
                  styles.recipientMeta
                }
              >
                {t(
                  "guestCount",
                  {
                    count:
                      recipient.guests.length,
                  }
                )}
              </span>
            </span>
          </button>
        </TableCell>


        {/* ====================================================================
            Link
        ==================================================================== */}

     <TableCell
  className={
    styles.link
  }
>
  <div
    className={
      styles.linkContent
    }
  >
    <div
      className={
        styles.linkRow
      }
    >
      <Tooltip>
        <TooltipTrigger
          asChild
        >
          <button
            type="button"
            className={
              styles.linkValue
            }
            onDoubleClick={
              handleOpenInvitation
            }
          >
            {personalizedPath}
          </button>
        </TooltipTrigger>

        <TooltipContent>
          {personalizedPath}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          asChild
        >
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
        </TooltipTrigger>

        <TooltipContent>
          {copied
            ? t(
                "details.link.copied"
              )
            : t(
                "details.link.copy"
              )}
        </TooltipContent>
      </Tooltip>
    </div>

    <span
      className={
        styles.linkHint
      }
    >
      {t(
        "table.linkHint"
      )}
    </span>
  </div>
</TableCell>


        {/* ====================================================================
            Guests
        ==================================================================== */}

        <TableCell
          className={
            styles.guests
          }
        >
          <div
            className={
              styles.guestList
            }
          >
            <span
              className={
                styles.guestNames
              }
            >
              {visibleGuests
                .map(
                  (guest) =>
                    [
                      guest.first_name,
                      guest.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")
                )
                .join(", ")}
            </span>

            {remainingGuestCount >
              0 && (
              <span
                className={
                  styles.remainingGuests
                }
              >
                {t(
                  "table.remainingGuests",
                  {
                    count:
                      remainingGuestCount,
                  }
                )}
              </span>
            )}
          </div>
        </TableCell>


        {/* ====================================================================
            RSVP
        ==================================================================== */}

        <TableCell
          className={
            styles.rsvp
          }
        >
          {hasSingleRsvpStatus ? (
            <>
              {pendingCount > 0 && (
                <InvitationRsvpStatusBadge
                  status="pending"
                  count={
                    pendingCount
                  }
                />
              )}

              {attendingCount > 0 && (
                <InvitationRsvpStatusBadge
                  status="attending"
                  count={
                    attendingCount
                  }
                />
              )}

              {declinedCount > 0 && (
                <InvitationRsvpStatusBadge
                  status="declined"
                  count={
                    declinedCount
                  }
                />
              )}
            </>
          ) : (
            <div
              className={
                styles.rsvpSummary
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
          )}
        </TableCell>


        {/* ====================================================================
            Updated
        ==================================================================== */}

        <TableCell
          className={
            styles.updated
          }
        >
          <div
            className={
              styles.updatedContent
            }
          >
            <CalendarDays
              className="size-4"
              aria-hidden="true"
            />

            <span
              className={
                styles.updatedValue
              }
            >
              {updatedAt}
            </span>
          </div>
        </TableCell>


        {/* ====================================================================
            Actions
        ==================================================================== */}

<TableCell
  className={
    styles.actions
  }
>
  <Tooltip>
    <TooltipTrigger
      asChild
    >
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
    </TooltipTrigger>

    <TooltipContent>
      {t(
        "actions.open"
      )}
    </TooltipContent>
  </Tooltip>
</TableCell>
      </TableRow>


      {/* ====================================================================
          Details
      ==================================================================== */}

      <InvitationRecipientDetails
        recipient={
          recipient
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