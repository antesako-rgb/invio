"use client";

import {
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  Copy,
  MoreHorizontal,
} from "lucide-react";

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

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";

import InvitationRecipientDetails
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientDetails/InvitationRecipientDetails";

import InvitationRsvpStatusBadge
  from "@/features/invitations/components/invitation-management/InvitationRsvpStatusBadge/InvitationRsvpStatusBadge";

import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationManagementRow,
} from "@/features/invitations/types/invitationManagement.types";

import {
  getInvitationPublicPath,
} from "@/features/invitations/utils/getInvitationPublicPath";

import {
  getInitials,
} from "@/lib/utils/getInitials";

import styles
  from "./InvitationRecipientRow.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientRowProps {
  invitationPublicId:
    string;

  row:
    InvitationManagementRow;

  questions:
    InvitationRsvpQuestion[];
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
  invitationPublicId,
  row,
  questions,
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
     Invitation Link
  ========================================================================== */

  const isPersonalized =
    row.public_id !==
    null;

  const invitationPath =
    getInvitationPublicPath(
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
     Guests
  ========================================================================== */

  const visibleGuests =
    row.guests.slice(
      0,
      VISIBLE_GUESTS
    );

  const remainingGuestCount =
    Math.max(
      row.guests.length -
        VISIBLE_GUESTS,
      0
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

  const hasSingleRsvpStatus =
    [
      attendingCount,
      declinedCount,
      pendingCount,
    ].filter(
      (count) =>
        count > 0
    ).length ===
    1;


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
                      row.guests.length,
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
                    {isPersonalized
                      ? invitationPath
                      : t(
                          "table.publicInvitation"
                        )}
                  </button>
                </TooltipTrigger>

                <TooltipContent>
                  {invitationPath}
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
              {pendingCount >
                0 && (
                <InvitationRsvpStatusBadge
                  status="pending"
                  count={
                    pendingCount
                  }
                />
              )}

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