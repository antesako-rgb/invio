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
  deleteEventExperienceAction,
} from "@/features/invitations/actions/experience/deleteEventExperienceAction";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceDeleteDangerZoneProps {
  experienceId:
    string;

  eventId:
    string;

  experienceType:
    EventExperienceType;
}


/* ==========================================================================
   Event Experience Delete Danger Zone
========================================================================== */

export default function EventExperienceDeleteDangerZone({
  experienceId,
  eventId,
  experienceType,
}: EventExperienceDeleteDangerZoneProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.delete"
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
        await deleteEventExperienceAction({
          experienceId,
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
          `title.${experienceType}`
        )
      }
      description={
        t(
          `description.${experienceType}`
        )
      }
      buttonText={
        t(
          `button.${experienceType}`
        )
      }
      tone="danger"
      confirmTitle={
        t(
          `confirm.title.${experienceType}`
        )
      }
      confirmDescription={
        t(
          "confirm.description"
        )
      }
      confirmText={
        t(
          `confirm.confirm.${experienceType}`
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