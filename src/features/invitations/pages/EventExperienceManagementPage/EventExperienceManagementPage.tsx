import {
  notFound,
} from "next/navigation";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import EventExperienceDeleteDangerZone
  from "@/features/invitations/components/experience-management/EventExperienceDeleteDangerZone/EventExperienceDeleteDangerZone";

import EventExperienceManagementHeader
  from "@/features/invitations/components/experience-management/EventExperienceManagementHeader/EventExperienceManagementHeader";

import EventExperiencePublicLinkCard
  from "@/features/invitations/components/experience-management/EventExperiencePublicLinkCard/EventExperiencePublicLinkCard";

import EventExperienceStatusCard
  from "@/features/invitations/components/experience-management/EventExperienceStatusCard/EventExperienceStatusCard";

import InvitationRsvpManagement
  from "@/features/invitations/components/invitation-management/InvitationRsvpManagement/InvitationRsvpManagement";

import PhotoWallManagement
  from "@/features/invitations/components/photo-wall-management/PhotoWallManagement/PhotoWallManagement";

import {
  getEventExperienceTemplateConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import {
  getEventExperience,
} from "@/features/invitations/repositories/experience/getEventExperience";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import styles
  from "./EventExperienceManagementPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceManagementPageProps {
  type:
    EventExperienceType;

  experienceId:
    string;
}


/* ==========================================================================
   Event Experience Management Page
========================================================================== */

export default async function EventExperienceManagementPage({
  type,
  experienceId,
}: EventExperienceManagementPageProps) {
  /* ==========================================================================
     Experience
  ========================================================================== */

  const experience =
    await getEventExperience(
      experienceId
    );

  if (
    !experience ||
    experience.type !== type
  ) {
    notFound();
  }


  /* ==========================================================================
     Template
  ========================================================================== */

  const template =
    getEventExperienceTemplateConfig(
      experience.type,
      experience.template_id
    );

  if (!template) {
    notFound();
  }


  /* ==========================================================================
     Management Capabilities
  ========================================================================== */

  const supportsRsvp =
    experience.type ===
      "invitation" &&
    template.features.rsvp;

  const supportsPhotos =
    experience.type ===
      "photo-wall" &&
    template.features.photos;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <EventExperienceManagementHeader
          experience={
            experience
          }
        />


        {/* ==================================================================
            Overview
        ================================================================== */}

        <div
          className={
            styles.overview
          }
        >
          <EventExperienceStatusCard
            experience={
              experience
            }
          />

          <EventExperiencePublicLinkCard
            experience={
              experience
            }
          />
        </div>


        {/* ==================================================================
            RSVP Management
        ================================================================== */}

        {supportsRsvp && (
          <InvitationRsvpManagement
            invitation={
              experience
            }
          />
        )}


        {/* ==================================================================
            Photo Wall Management
        ================================================================== */}

        {supportsPhotos && (
          <PhotoWallManagement
            experience={
              experience
            }
          />
        )}


        {/* ==================================================================
            Danger Zone
        ================================================================== */}

        <EventExperienceDeleteDangerZone
          experienceId={
            experience.id
          }
          eventId={
            experience.event_id
          }
          experienceType={
            experience.type
          }
        />
      </Page>
    </Container>
  );
}