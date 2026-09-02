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

import type {
  EventGuest,
  GuestGroup,
} from "../../types/guest.types";

import styles
  from "./GuestRow.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestRowProps {
  guest:
    EventGuest;

  group:
    GuestGroup | null;

  primaryGuest:
    EventGuest | null;

  onEdit?:
    () => void;
}


/* ==========================================================================
   Guest Row
========================================================================== */

export default function GuestRow({
  guest,
  group,
  primaryGuest,
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
     Primary Guest Name
  ========================================================================== */

  const primaryGuestName =
    primaryGuest
      ? [
          primaryGuest.first_name,
          primaryGuest.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      : null;


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
          Primary Guest
      ==================================================================== */}

      <TableCell
        className={
          styles.primaryGuest
        }
      >
        {primaryGuestName ? (
          <span>
            {primaryGuestName}
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