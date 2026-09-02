import {
  notFound,
} from "next/navigation";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import InvitationDeleteDangerZone
  from "@/features/invitations/components/invitation-management/InvitationDeleteDangerZone/InvitationDeleteDangerZone";

import InvitationManagementHeader
  from "@/features/invitations/components/invitation-management/InvitationManagementHeader/InvitationManagementHeader";

import InvitationPublicLinkCard
  from "@/features/invitations/components/invitation-management/InvitationPublicLinkCard/InvitationPublicLinkCard";

import InvitationRecipients
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipients";

import InvitationRsvpSummary
  from "@/features/invitations/components/invitation-management/InvitationRsvpSummary/InvitationRsvpSummary";

import InvitationStatusCard
  from "@/features/invitations/components/invitation-management/InvitationStatusCard/InvitationStatusCard";

import {
  getInvitation,
} from "@/features/invitations/repositories/invitation/getInvitation";

import {
  getInvitationRecipients,
} from "@/features/invitations/repositories/invitation-recipients/getInvitationRecipients";

import {
  getEventGuestsPageData,
} from "@/features/guests/repositories/getEventGuestsPageData";
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
    await getInvitation(
      invitationId
    );

  if (!invitation) {
    notFound();
  }


  /* ==========================================================================
     Management Data
  ========================================================================== */

  const [
    recipients,
    guestsData,
  ] =
    await Promise.all([
      getInvitationRecipients({
        p_invitation_id:
          invitation.id,
      }),

      getEventGuestsPageData(
        invitation.event_id
      ),
    ]);


  /* ==========================================================================
     Available Guests
  ========================================================================== */

  const assignedGuestIds =
    new Set(
      recipients.flatMap(
        (recipient) =>
          recipient.guests.map(
            (guest) =>
              guest.id
          )
      )
    );

  const availableGuests =
    guestsData.guests.filter(
      (guest) =>
        !assignedGuestIds.has(
          guest.id
        )
    );


  /* ==========================================================================
     RSVP Summary
  ========================================================================== */

  const recipientGuests =
    recipients.flatMap(
      (recipient) =>
        recipient.guests
    );

  const total =
    recipientGuests.length;

  const attending =
    recipientGuests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "attending"
    ).length;

  const declined =
    recipientGuests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "declined"
    ).length;

  const pending =
    total -
    attending -
    declined;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <InvitationManagementHeader
          invitation={
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
          <InvitationStatusCard
            invitation={
              invitation
            }
          />

          <InvitationPublicLinkCard
            invitation={
              invitation
            }
          />
        </div>


        {/* ==================================================================
            RSVP Summary
        ================================================================== */}

        <InvitationRsvpSummary
          total={
            total
          }
          attending={
            attending
          }
          declined={
            declined
          }
          pending={
            pending
          }
        />


        {/* ==================================================================
            Recipients
        ================================================================== */}

<InvitationRecipients
  invitationId={
    invitation.id
  }
  recipients={
    recipients
  }
  availableGuests={
    availableGuests
  }
  groups={
    guestsData.groups
  }
/>


        {/* ==================================================================
            Danger Zone
        ================================================================== */}

        <InvitationDeleteDangerZone
          invitationId={
            invitation.id
          }
          eventId={
            invitation.event_id
          }
        />
      </Page>
    </Container>
  );
}