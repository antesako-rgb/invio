"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import DangerZone
  from "@/components/ui/danger-zone/DangerZone";

import {
  deleteInvitationAction,
} from "@/features/invitations/actions/invitation/deleteInvitationAction";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationDeleteDangerZoneProps {
  invitationId:
    string;

  eventId:
    string;
}


/* ==========================================================================
   Invitation Delete Danger Zone
========================================================================== */

export default function InvitationDeleteDangerZone({
  invitationId,
  eventId,
}: InvitationDeleteDangerZoneProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.delete"
    );


  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(
      true
    );

    try {
      const result =
        await deleteInvitationAction({
          invitationId,
          eventId,
        });

      if (!result.success) {
        return;
      }

      router.replace(
        `/dashboard/dogadaji/${eventId}/pozivnice`
      );

      router.refresh();
    } finally {
      setIsDeleting(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DangerZone
      title={
        t(
          "title"
        )
      }
      description={
        t(
          "description"
        )
      }
      buttonText={
        t(
          "button"
        )
      }
      tone="danger"
      confirmTitle={
        t(
          "confirm.title"
        )
      }
      confirmDescription={
        t(
          "confirm.description"
        )
      }
      confirmText={
        t(
          "confirm.confirm"
        )
      }
      cancelText={
        t(
          "confirm.cancel"
        )
      }
      loading={
        isDeleting
      }
      onConfirm={
        handleDelete
      }
    />
  );
}