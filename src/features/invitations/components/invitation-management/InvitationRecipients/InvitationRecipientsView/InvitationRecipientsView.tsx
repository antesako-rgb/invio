"use client";

import {
  useMemo,
  useState,
} from "react";

import InvitationRecipientsFilters
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientsFilters/InvitationRecipientsFilters";

import InvitationRecipientsTable
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientsTable/InvitationRecipientsTable";

import type {
  InvitationRecipientDetails,
  InvitationRecipientRsvpFilter,
} from "@/features/invitations/types/invitationRecipient.types";

import styles
  from "./InvitationRecipientsView.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientsViewProps {
  recipients:
    InvitationRecipientDetails[];
}


/* ==========================================================================
   Invitation Recipients View
========================================================================== */

export default function InvitationRecipientsView({
  recipients,
}: InvitationRecipientsViewProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    rsvpFilter,
    setRsvpFilter,
  ] =
    useState<
      InvitationRecipientRsvpFilter
    >("all");


  /* ==========================================================================
     Filtered Recipients
  ========================================================================== */

  const filteredRecipients =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase();

        return recipients.filter(
          (recipient) => {
            /* ==================================================================
               Search
            ================================================================== */

            const matchesSearch =
              normalizedSearch.length ===
                0 ||
              recipient.guests.some(
                (guest) => {
                  const searchableValue = [
                    guest.first_name,
                    guest.last_name,
                    guest.email,
                    guest.phone,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    )
                    .toLocaleLowerCase();

                  return searchableValue.includes(
                    normalizedSearch
                  );
                }
              );

            if (
              !matchesSearch
            ) {
              return false;
            }


            /* ==================================================================
               RSVP
            ================================================================== */

            if (
              rsvpFilter ===
              "all"
            ) {
              return true;
            }

            return recipient.guests.some(
              (guest) => {
                const status =
                  guest.rsvp
                    ?.status;

                if (
                  rsvpFilter ===
                  "pending"
                ) {
                  return (
                    status !==
                      "attending" &&
                    status !==
                      "declined"
                  );
                }

                return (
                  status ===
                  rsvpFilter
                );
              }
            );
          }
        );
      },
      [
        recipients,
        search,
        rsvpFilter,
      ]
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.view
      }
    >
      <InvitationRecipientsFilters
        search={
          search
        }
        rsvpFilter={
          rsvpFilter
        }
        onSearchChange={
          setSearch
        }
        onRsvpFilterChange={
          setRsvpFilter
        }
      />

      <InvitationRecipientsTable
        recipients={
          filteredRecipients
        }
      />
    </div>
  );
}