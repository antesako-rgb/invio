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

import {
  getEventExperienceTemplateConfig,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import {
  getEventExperience,
} from "@/features/invitations/repositories/experience/getEventExperience";

import styles
  from "./InvitationManagementPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationManagementPageProps {
  invitationId:
    string;
}


/* ==========================================================================
   Invitation Management Page
========================================================================== */

export default async function InvitationManagementPage({
  invitationId,
}: InvitationManagementPageProps) {
  /* ==========================================================================
     Invitation
  ========================================================================== */

  const invitation =
    await getEventExperience(
      invitationId
    );

  if (!invitation) {
    notFound();
  }


  /* ==========================================================================
     Template
  ========================================================================== */

const template =
  getEventExperienceTemplateConfig(
    invitation.type,
    invitation.template_id
  );

if (!template) {
  notFound();
}

  const supportsRsvp =
    template.features.rsvp;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <EventExperienceManagementHeader
          experience={
            invitation
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
              invitation
            }
          />

          <EventExperiencePublicLinkCard
            experience={
              invitation
            }
          />
        </div>


        {/* ==================================================================
            RSVP Management
        ================================================================== */}

        {supportsRsvp && (
          <InvitationRsvpManagement
            invitation={
              invitation
            }
          />
        )}


        {/* ==================================================================
            Danger Zone
        ================================================================== */}

        <EventExperienceDeleteDangerZone
          experienceId={
            invitation.id
          }
          eventId={
            invitation.event_id
          }
       experienceType={
  invitation.type
}
        />
      </Page>
    </Container>
  );
}