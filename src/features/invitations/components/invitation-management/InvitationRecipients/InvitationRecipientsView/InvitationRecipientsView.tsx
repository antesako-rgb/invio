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
  InvitationRsvpQuestion,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationManagementGuest,
  InvitationManagementRow,
} from "@/features/invitations/types/invitationManagement.types";

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
  invitationPublicId:
    string;

  recipients:
    InvitationRecipientDetails[];

  managementGuests:
    InvitationManagementGuest[];

  questions:
    InvitationRsvpQuestion[];
}


/* ==========================================================================
   Invitation Recipients View
========================================================================== */

export default function InvitationRecipientsView({
  invitationPublicId,
  recipients,
  managementGuests,
  questions,
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
     Rows
  ========================================================================== */

  const rows =
    useMemo<
      InvitationManagementRow[]
    >(
      () => {
        const personalizedRows:
          InvitationManagementRow[] =
          recipients.map(
            (recipient) => ({
              id:
                recipient.id,

              recipient_id:
                recipient.id,

              public_id:
                recipient.public_id,

              guests:
                recipient.guests.map(
                  (guest) => ({
                    id:
                      guest.id,

                    first_name:
                      guest.first_name,

                    last_name:
                      guest.last_name,

                    email:
                      guest.email,

                    phone:
                      guest.phone,

                    is_primary_recipient:
                      guest.is_primary_recipient,

                    rsvp:
                      guest.rsvp
                        ? {
                            status:
                              guest.rsvp.status,

                            answers:
                              guest.rsvp.answers,

                            responded_at:
                              guest.rsvp.responded_at,

                            updated_at:
                              guest.rsvp.updated_at,
                          }
                        : null,
                  })
                ),

              created_at:
                recipient.created_at,

              updated_at:
                recipient.updated_at,
            })
          );

        const genericRows:
          InvitationManagementRow[] =
          managementGuests
            .filter(
              (guest) =>
                guest.recipient_id ===
                null
            )
            .map(
              (guest) => ({
                id:
                  guest.id,

                recipient_id:
                  null,

                public_id:
                  null,

                guests: [
                  {
                    id:
                      guest.id,

                    first_name:
                      guest.first_name,

                    last_name:
                      guest.last_name,

                    email:
                      guest.email,

                    phone:
                      guest.phone,

                    is_primary_recipient:
                      false,

                    rsvp:
                      guest.rsvp,
                  },
                ],

                created_at:
                  guest.assigned_at,

                updated_at:
                  guest.rsvp
                    ?.updated_at ??
                  guest.assigned_at,
              })
            );

        return [
          ...personalizedRows,
          ...genericRows,
        ];
      },
      [
        recipients,
        managementGuests,
      ]
    );


  /* ==========================================================================
     Search
  ========================================================================== */

  const normalizedSearch =
    useMemo(
      () =>
        search
          .trim()
          .toLocaleLowerCase(),
      [
        search,
      ]
    );


  /* ==========================================================================
     Filtered Rows
  ========================================================================== */

  const filteredRows =
    useMemo(
      () => {
        return rows.filter(
          (row) => {
            /* ==================================================================
               Search
            ================================================================== */

            const matchesSearch =
              normalizedSearch.length ===
                0 ||
              row.guests.some(
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

            return row.guests.some(
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
        rows,
        normalizedSearch,
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
        invitationPublicId={
          invitationPublicId
        }
        rows={
          filteredRows
        }
        questions={
          questions
        }
      />
    </div>
  );
}