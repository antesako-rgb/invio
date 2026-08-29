"use client";

import {
  useTranslations,
} from "next-intl";

import { Badge } from "@/components/ui/badge/badge";

import type {
  GuestRsvpStatus,
} from "../../types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface GuestStatusBadgeProps {
  status:
    GuestRsvpStatus;
}


/* ==========================================================================
   Guest Status Badge
========================================================================== */

export default function GuestStatusBadge({
  status,
}: GuestStatusBadgeProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.rsvp"
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