"use client";

import {
  useTranslations,
} from "next-intl";

import {
  Badge,
} from "@/components/ui/badge/badge";

import type {
  InvitationRsvpDisplayStatus,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRsvpStatusBadgeProps {
  status:
    InvitationRsvpDisplayStatus;

  count?:
    number;
}


/* ==========================================================================
   Invitation RSVP Status Badge
========================================================================== */

export default function InvitationRsvpStatusBadge({
  status,
  count,
}: InvitationRsvpStatusBadgeProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.rsvpStatus"
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
     Label
  ========================================================================== */

  const label =
    count === undefined
      ? t(
          status
        )
      : t(
          `${status}Count`,
          {
            count,
          }
        );


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
      {label}
    </Badge>
  );
}