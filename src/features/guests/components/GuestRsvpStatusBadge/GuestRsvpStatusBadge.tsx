"use client";

import {
  useTranslations,
} from "next-intl";

import {
  Badge,
} from "@/components/ui/badge/badge";

import type {
  GuestRsvpStatus,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

type GuestRsvpDisplayStatus =
  | GuestRsvpStatus
  | "not_sent"
  | "awaiting_response";

interface GuestRsvpStatusBadgeProps {
  status:
    GuestRsvpDisplayStatus;
}


/* ==========================================================================
   Guest RSVP Status Badge
========================================================================== */

export default function GuestRsvpStatusBadge({
  status,
}: GuestRsvpStatusBadgeProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.rsvpStatus"
    );


  /* ==========================================================================
     Variant
  ========================================================================== */
const variant =
  status === "attending"
    ? "success"
    : status === "declined"
      ? "destructive"
      : status === "not_sent"
        ? "muted"
        : "warning";


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Badge
      variant={
        variant
      }
      size="sm"
      dot
    >
      {t(
        status
      )}
    </Badge>
  );
}