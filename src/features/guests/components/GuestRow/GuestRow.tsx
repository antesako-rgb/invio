"use client";

import {
  MoreHorizontal,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/data-table";

import GuestRsvpConflict
  from "@/features/guests/components/GuestRsvpConflict/GuestRsvpConflict";

import type {
  EventGuestWithRsvp,
  GuestGroup,
} from "@/features/guests/types/guest.types";

import styles
  from "./GuestRow.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestRowProps {
  guest:
    EventGuestWithRsvp;

  group:
    GuestGroup | null;

  hasPrimaryRsvpInvitation:
    boolean;

  onEdit?:
    () => void;
}


/* ==========================================================================
   Guest Row
========================================================================== */

export default function GuestRow({
  guest,
  group,
  hasPrimaryRsvpInvitation,
  onEdit,
}: GuestRowProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests"
    );


  /* ==========================================================================
     Guest Name
  ========================================================================== */

  const fullName =
    [
      guest.first_name,
      guest.last_name,
    ]
      .filter(Boolean)
      .join(" ");


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <TableRow
      className={
        styles.row
      }
    >
      {/* ====================================================================
          Guest
      ==================================================================== */}

      <TableCell
        className={
          styles.guest
        }
      >
        <span
          className={
            styles.name
          }
        >
          {fullName}
        </span>
      </TableCell>


      {/* ====================================================================
          Contact
      ==================================================================== */}

      <TableCell
        className={
          styles.contact
        }
      >
        {guest.email ||
        guest.phone ? (
          <div
            className={
              styles.contactContent
            }
          >
            {guest.email && (
              <span
                className={
                  styles.email
                }
              >
                {guest.email}
              </span>
            )}

            {guest.phone && (
              <span
                className={
                  styles.phone
                }
              >
                {guest.phone}
              </span>
            )}
          </div>
        ) : (
          <span
            className={
              styles.empty
            }
          >
            —
          </span>
        )}
      </TableCell>


      {/* ====================================================================
          Group
      ==================================================================== */}

      <TableCell
        className={
          styles.group
        }
      >
        {group ? (
          <span
            className={
              styles.groupName
            }
          >
            {group.name}
          </span>
        ) : (
          <span
            className={
              styles.empty
            }
          >
            —
          </span>
        )}
      </TableCell>


      {/* ====================================================================
          RSVP
      ==================================================================== */}

      <TableCell
        className={
          styles.rsvp
        }
      >
        <GuestRsvpConflict
          masterStatus={
            guest.rsvp_status
          }
          primaryRsvpStatus={
            guest.primary_rsvp_status
          }
          hasPrimaryRsvpInvitation={
            hasPrimaryRsvpInvitation
          }
          isOnPrimaryRsvpInvitation={
            guest.is_on_primary_rsvp_invitation
          }
          hasConflict={
            guest.has_rsvp_conflict
          }
        />
      </TableCell>


      {/* ====================================================================
          Notes
      ==================================================================== */}

      <TableCell
        className={
          styles.notes
        }
      >
        {guest.notes ? (
          <span
            className={
              styles.notesText
            }
          >
            {guest.notes}
          </span>
        ) : (
          <span
            className={
              styles.empty
            }
          >
            —
          </span>
        )}
      </TableCell>


      {/* ====================================================================
          Actions
      ==================================================================== */}

      <TableCell
        className={
          styles.actions
        }
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
            onEdit
          }
        >
          <MoreHorizontal
            className="size-4"
            aria-hidden="true"
          />
        </Button>
      </TableCell>
    </TableRow>
  );
}