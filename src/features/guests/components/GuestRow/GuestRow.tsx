"use client";

import {
  MoreHorizontal,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  TableCell,
  TableRow,
} from "@/components/ui/data-table";

import GuestStatusBadge
  from "../GuestStatusBadge/GuestStatusBadge";

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

  onEdit?:
    () => void;
}


/* ==========================================================================
   Guest Row
========================================================================== */

export default function GuestRow({
  guest,
  group,
  onEdit,
}: GuestRowProps) {
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
      {/* Guest */}

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


      {/* Contact */}

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


      {/* Group */}

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


      {/* RSVP */}

      <TableCell
        className={
          styles.status
        }
      >
        <GuestStatusBadge
          status={
            guest.rsvp_status
          }
        />
      </TableCell>


      {/* Actions */}

      <TableCell
        className={
          styles.actions
        }
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Guest actions"
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