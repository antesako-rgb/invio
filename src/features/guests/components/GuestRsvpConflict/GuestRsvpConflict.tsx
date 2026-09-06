"use client";

import {
  TriangleAlert,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";

import GuestRsvpStatusBadge
  from "@/features/guests/components/GuestRsvpStatusBadge/GuestRsvpStatusBadge";

import type {
  GuestRsvpStatus,
} from "@/features/guests/types/guest.types";

import styles
  from "./GuestRsvpConflict.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestRsvpConflictProps {
  masterStatus:
    GuestRsvpStatus;

  primaryRsvpStatus:
    GuestRsvpStatus | null;

  hasPrimaryRsvpInvitation:
    boolean;

  isOnPrimaryRsvpInvitation:
    boolean;

  hasConflict:
    boolean;
}


/* ==========================================================================
   Guest RSVP Conflict
========================================================================== */

export default function GuestRsvpConflict({
  masterStatus,
  primaryRsvpStatus,
  hasPrimaryRsvpInvitation,
  isOnPrimaryRsvpInvitation,
  hasConflict,
}: GuestRsvpConflictProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.rsvpConflict"
    );


  /* ==========================================================================
     Not On Primary RSVP Invitation
  ========================================================================== */

  if (
    hasPrimaryRsvpInvitation &&
    !isOnPrimaryRsvpInvitation &&
    masterStatus === "unknown"
  ) {
    return (
      <GuestRsvpStatusBadge
        status="not_sent"
      />
    );
  }


  /* ==========================================================================
     Awaiting Response
  ========================================================================== */

  if (
    hasPrimaryRsvpInvitation &&
    isOnPrimaryRsvpInvitation &&
    masterStatus === "unknown" &&
    !hasConflict
  ) {
    return (
      <GuestRsvpStatusBadge
        status="awaiting_response"
      />
    );
  }


  /* ==========================================================================
     No Conflict
  ========================================================================== */

  if (
    !hasConflict ||
    !primaryRsvpStatus
  ) {
    return (
      <GuestRsvpStatusBadge
        status={
          masterStatus
        }
      />
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      <GuestRsvpStatusBadge
        status={
          masterStatus
        }
      />

      <Tooltip>
        <TooltipTrigger
          asChild
        >
          <button
            type="button"
            className={
              styles.warning
            }
            aria-label={
              t(
                "warning"
              )
            }
          >
            <TriangleAlert
              className="size-4"
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>

        <TooltipContent
          className={
            styles.tooltip
          }
        >
          <div
            className={
              styles.content
            }
          >
            <span
              className={
                styles.title
              }
            >
              {t(
                "title"
              )}
            </span>

            <span
              className={
                styles.description
              }
            >
              {t(
                "description"
              )}
            </span>

            <div
              className={
                styles.response
              }
            >
              <span>
                {t(
                  "primaryResponse"
                )}
              </span>

              <GuestRsvpStatusBadge
                status={
                  primaryRsvpStatus
                }
              />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}