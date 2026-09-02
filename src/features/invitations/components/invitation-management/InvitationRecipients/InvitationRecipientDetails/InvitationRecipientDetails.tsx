"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Copy,
  UserRound,
  Users,
} from "lucide-react";
import {
  getInvitationPublicPath,
} from "@/features/invitations/utils/getInvitationPublicPath";
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

import InvitationRsvpStatusBadge
  from "@/features/invitations/components/invitation-management/InvitationRsvpStatusBadge/InvitationRsvpStatusBadge";

import type {
  InvitationRecipientDetails as InvitationRecipientDetailsType,
} from "@/features/invitations/types/invitationRecipient.types";

import styles
  from "./InvitationRecipientDetails.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientDetailsProps {
  recipient:
    InvitationRecipientDetailsType;

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
  open,
  onOpenChange,
}: InvitationRecipientDetailsProps) {
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
            {primaryGuestName}
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

            <div
              className={
                styles.guests
              }
            >
              {recipient.guests.map(
                (guest) => {
                  const guestName =
                    [
                      guest.first_name,
                      guest.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ");

                  return (
                    <div
                      key={
                        guest.id
                      }
                      className={
                        styles.guest
                      }
                    >
                      <div
                        className={
                          styles.guestIdentity
                        }
                      >
                        <div
                          className={
                            styles.guestIcon
                          }
                        >
                          <UserRound
                            className="size-4"
                            aria-hidden="true"
                          />
                        </div>

                        <div>
                          <strong>
                            {guestName}
                          </strong>

                          {guest.email && (
                            <span>
                              {guest.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <InvitationRsvpStatusBadge
                        status={
                          guest.rsvp?.status ??
                          "pending"
                        }
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}