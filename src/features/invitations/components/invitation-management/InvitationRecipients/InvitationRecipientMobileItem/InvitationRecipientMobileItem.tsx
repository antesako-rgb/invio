"use client";

import {
  CalendarDays,
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
import type {
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";
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

import {
  getInitials,
} from "@/lib/utils/getInitials";

import styles
  from "./InvitationRecipientMobileItem.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientMobileItemProps {
  recipient:
    InvitationRecipientDetailsType;

  questions:
    InvitationRsvpQuestion[];
}


export default function InvitationRecipientMobileItem({
  recipient,
  questions,
}: InvitationRecipientMobileItemProps) {

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
        recipient.updated_at
      )
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <article
        className={
          styles.item
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
              () =>
                setDetailsOpen(
                  true
                )
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
                      recipient.guests.length,
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
              () =>
                setDetailsOpen(
                  true
                )
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

        <button
          type="button"
          className={
            styles.link
          }
          onClick={
            () =>
              window.open(
                personalizedPath,
                "_blank",
                "noopener,noreferrer"
              )
          }
        >
          {personalizedPath}
        </button>


        {/* ==================================================================
            Guests
        ================================================================== */}

        <div
          className={
            styles.guests
          }
        >
          {recipient.guests
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

            {pendingCount > 0 && (
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
  recipient={
    recipient
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