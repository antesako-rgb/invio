"use client";

import {
  useTranslations,
} from "next-intl";

import {
  Badge,
} from "@/components/ui/badge/badge";

import type {
  EventGuest,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface GuestRsvpStatusBadgeProps {
  status:
    EventGuest["rsvp_status"];
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