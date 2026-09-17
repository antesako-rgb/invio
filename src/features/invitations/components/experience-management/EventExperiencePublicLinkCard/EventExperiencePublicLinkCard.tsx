import {
  getTranslations,
} from "next-intl/server";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import {
  getEventExperiencePublicPath,
} from "@/features/invitations/utils/getEventExperiencePublicPath";

import ManagementPublicLinkCard
  from "@/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCard";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencePublicLinkCardProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Event Experience Public Link Card
========================================================================== */

export default async function EventExperiencePublicLinkCard({
  experience,
}: EventExperiencePublicLinkCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "EventExperiences.management.publicLinkCard"
    );


  /* ==========================================================================
     Experience
  ========================================================================== */

  const experienceType =
    experience.type;


  /* ==========================================================================
     Public Path
  ========================================================================== */

const publicPath =
  getEventExperiencePublicPath(
    experienceType,
    experience.public_id
  );


  /* ==========================================================================
     Status
  ========================================================================== */

  const isPublished =
    experience.is_public;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <ManagementPublicLinkCard
      title={
        t(
          "title"
        )
      }
      description={
        t(
          `description.${experienceType}`
        )
      }
      publicPath={
        publicPath
      }
      isActive={
        isPublished
      }
      activeTitle={
        t(
          "active.title"
        )
      }
      inactiveTitle={
        t(
          "inactive.title"
        )
      }
      activeDescription={
        t(
          `active.description.${experienceType}`
        )
      }
      inactiveDescription={
        t(
          `inactive.description.${experienceType}`
        )
      }
      copyLabel={
        t(
          "actions.copy"
        )
      }
      copiedLabel={
        t(
          "actions.copied"
        )
      }
      openLabel={
        t(
          `actions.open.${experienceType}`
        )
      }
    />
  );
}