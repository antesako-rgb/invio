"use client";

import {
  UserRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import InvitationRsvpStatusBadge
  from "@/features/invitations/components/invitation-management/InvitationRsvpStatusBadge/InvitationRsvpStatusBadge";

import type {
  InvitationManagementGuest,
} from "@/features/invitations/types/invitationManagement.types";

import type {
  InvitationRsvpDisplayStatus,
} from "@/features/invitations/types/invitationRsvp.types";

import styles
  from "./InvitationRsvpGuests.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRsvpGuestsProps {
  guests:
    InvitationManagementGuest[];

  onGuestClick:
    (guestId: string) => void;
}


/* ==========================================================================
   Invitation RSVP Guests
========================================================================== */

export default function InvitationRsvpGuests({
  guests,
  onGuestClick,
}: InvitationRsvpGuestsProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.rsvpAnswers"
    );


  /* ==========================================================================
     Empty
  ========================================================================== */

  if (
    guests.length ===
    0
  ) {
    return (
      <div
        className={
          styles.empty
        }
      >
        <UserRound
          aria-hidden="true"
        />

        <strong>
          {t(
            "guests.empty.title"
          )}
        </strong>

        <span>
          {t(
            "guests.empty.description"
          )}
        </span>
      </div>
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.list
      }
    >
      {guests.map(
        (guest) => {
          const status:
            InvitationRsvpDisplayStatus =
              guest.rsvp?.status ??
              "pending";

          const fullName =
            [
              guest.first_name,
              guest.last_name,
            ]
              .filter(
                Boolean
              )
              .join(
                " "
              );

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
                  styles.identity
                }
              >
                <div
                  className={
                    styles.avatar
                  }
                  aria-hidden="true"
                >
                  <UserRound />
                </div>

                <button
                  type="button"
                  className={
                    styles.name
                  }
                  onClick={
                    () =>
                      onGuestClick(
                        guest.id
                      )
                  }
                >
                  {fullName}
                </button>
              </div>

              <InvitationRsvpStatusBadge
                status={
                  status
                }
              />
            </div>
          );
        }
      )}
    </div>
  );
}