import {
  getTranslations,
} from "next-intl/server";

import EventExperienceStatusAction
  from "@/features/invitations/components/experience-management/EventExperienceStatusCard/EventExperienceStatusAction";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import ManagementStatusCard
  from "@/features/management/components/ManagementStatusCard/ManagementStatusCard";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceStatusCardProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Event Experience Status Card
========================================================================== */

export default async function EventExperienceStatusCard({
  experience,
}: EventExperienceStatusCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "EventExperiences.management.statusCard"
    );


  /* ==========================================================================
     Experience
  ========================================================================== */

  const experienceType =
    experience.type;


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    experience.is_public;

  const statusTitle =
    isPublished
      ? t(
          `published.title.${experienceType}`
        )
      : t(
          `draft.title.${experienceType}`
        );

  const statusDescription =
    isPublished
      ? t(
          `published.description.${experienceType}`
        )
      : t(
          `draft.description.${experienceType}`
        );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementStatusCard
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
      statusTitle={
        statusTitle
      }
      statusDescription={
        statusDescription
      }
      isPublished={
        isPublished
      }
      action={
        <EventExperienceStatusAction
          experienceId={
            experience.id
          }
          isPublished={
            isPublished
          }
          experienceType={
            experienceType
          }
        />
      }
    />
  );
}