"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import ManagementDeleteDangerZone
  from "@/features/management/components/ManagementDeleteDangerZone/ManagementDeleteDangerZone";

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
     Delete
  ========================================================================== */

  async function handleDelete() {
    const result =
      await deleteEventExperienceAction({
        experienceId,
        eventId,
      });

    if (!result.success) {
      return;
    }

    router.replace(
      `/dashboard/dogadaji/${eventId}/studio`
    );

    router.refresh();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementDeleteDangerZone
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
      onDelete={
        handleDelete
      }
    />
  );
}