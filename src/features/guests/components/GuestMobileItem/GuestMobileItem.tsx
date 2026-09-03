"use client";

import {
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

import GuestRsvpStatusBadge
  from "@/features/guests/components/GuestRsvpStatusBadge/GuestRsvpStatusBadge";

import type {
  EventGuest,
  GuestGroup,
} from "@/features/guests/types/guest.types";

import {
  getInitials,
} from "@/lib/utils/getInitials";

import styles
  from "./GuestMobileItem.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestMobileItemProps {
  guest:
    EventGuest;

  group:
    GuestGroup | null;

  onEdit?:
    () => void;
}


/* ==========================================================================
   Guest Mobile Item
========================================================================== */

export default function GuestMobileItem({
  guest,
  group,
  onEdit,
}: GuestMobileItemProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests"
    );


  /* ==========================================================================
     Guest
  ========================================================================== */

  const fullName =
    [
      guest.first_name,
      guest.last_name,
    ]
      .filter(Boolean)
      .join(" ");

  const initials =
    getInitials(
      fullName
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <article
      className={
        styles.item
      }
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div
        className={
          styles.header
        }
      >
        <button
          type="button"
          className={
            styles.guest
          }
          onClick={
            onEdit
          }
          disabled={
            !onEdit
          }
        >
          <Avatar
            alt={
              fullName
            }
            fallback={
              initials
            }
            size="sm"
          />

          <span
            className={
              styles.guestContent
            }
          >
            <strong>
              {fullName}
            </strong>

            <span>
              {group
                ? group.name
                : t(
                    "table.noGroup"
                  )}
            </span>
          </span>
        </button>

        {onEdit && (
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
        )}
      </div>


      {/* ====================================================================
          Contact
      ==================================================================== */}

      {(guest.email ||
        guest.phone) && (
        <div
          className={
            styles.contact
          }
        >
          {guest.email && (
            <span>
              {guest.email}
            </span>
          )}

          {guest.phone && (
            <span>
              {guest.phone}
            </span>
          )}
        </div>
      )}


      {/* ====================================================================
          Footer
      ==================================================================== */}

      <div
        className={
          styles.footer
        }
      >
        <GuestRsvpStatusBadge
          status={
            guest.rsvp_status
          }
        />

        {guest.notes && (
          <span
            className={
              styles.notes
            }
          >
            {guest.notes}
          </span>
        )}
      </div>
    </article>
  );
}