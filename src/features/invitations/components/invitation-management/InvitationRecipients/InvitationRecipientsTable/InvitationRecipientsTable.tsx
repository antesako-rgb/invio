"use client";

import {
  Users,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  DataTable,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-table";

import InvitationRecipientRow
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipientRow/InvitationRecipientRow";

import type {
  InvitationRecipientDetails,
} from "@/features/invitations/types/invitationRecipient.types";

import styles
  from "./InvitationRecipientsTable.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientsTableProps {
  recipients:
    InvitationRecipientDetails[];
}


/* ==========================================================================
   Invitation Recipients Table
========================================================================== */

export default function InvitationRecipientsTable({
  recipients,
}: InvitationRecipientsTableProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.table"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DataTable
      data={
        recipients
      }
      emptyState={{
        icon:
          Users,

        title:
          t(
            "emptyTitle"
          ),

        description:
          t(
            "emptyDescription"
          ),
      }}
    >
      <Table
        className={
          styles.table
        }
      >
        <TableHeader
          className={
            styles.header
          }
        >
          <TableRow>
            <TableHead
              scope="col"
              className={
                styles.recipientColumn
              }
            >
              {t(
                "recipient"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.linkColumn
              }
            >
              {t(
                "link"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.guestsColumn
              }
            >
              {t(
                "guests"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.rsvpColumn
              }
            >
              {t(
                "rsvp"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.updatedColumn
              }
            >
              {t(
                "updated"
              )}
            </TableHead>

            <TableHead
              scope="col"
              className={
                styles.actionsColumn
              }
            >
              <span
                className="sr-only"
              >
                {t(
                  "actions"
                )}
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>


        <TableBody
          className={
            styles.body
          }
        >
          {recipients.map(
            (recipient) => (
              <InvitationRecipientRow
                key={
                  recipient.id
                }
                recipient={
                  recipient
                }
              />
            )
          )}
        </TableBody>
      </Table>
    </DataTable>
  );
}