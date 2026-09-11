import InvitationRecipients
  from "@/features/invitations/components/invitation-management/InvitationRecipients/InvitationRecipients";

import InvitationRsvpSummary
  from "@/features/invitations/components/invitation-management/InvitationRsvpSummary/InvitationRsvpSummary";

import {
  getInvitationManagementGuests,
} from "@/features/invitations/repositories/invitation-recipients/getInvitationManagementGuests";

import {
  getInvitationRecipients,
} from "@/features/invitations/repositories/invitation-recipients/getInvitationRecipients";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";

import {
  getEventGuestsPageData,
} from "@/features/guests/repositories/getEventGuestsPageData";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRsvpManagementProps {
  invitation:
    EventExperience;
}


/* ==========================================================================
   Invitation RSVP Management
========================================================================== */

export default async function InvitationRsvpManagement({
  invitation,
}: InvitationRsvpManagementProps) {
  /* ==========================================================================
     Invitation Content
  ========================================================================== */

  const content =
    invitation.content as
      unknown as
      EventExperienceContent;

  const rsvpQuestions =
    content.rsvp?.questions ??
    [];


  /* ==========================================================================
     Management Data
  ========================================================================== */

  const [
    recipients,
    managementGuests,
    guestsData,
  ] =
    await Promise.all([
      getInvitationRecipients({
        invitationId:
          invitation.id,
      }),

      getInvitationManagementGuests({
        invitationId:
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
      managementGuests.map(
        (guest) =>
          guest.id
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

  const total =
    managementGuests.length;

  const attending =
    managementGuests.filter(
      (guest) =>
        guest.rsvp?.status ===
        "attending"
    ).length;

  const declined =
    managementGuests.filter(
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
    <>
      {/* ====================================================================
          RSVP Summary
      ==================================================================== */}

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
        questions={
          rsvpQuestions
        }
        guests={
          managementGuests
        }
      />


      {/* ====================================================================
          Recipients
      ==================================================================== */}

      <InvitationRecipients
        invitationId={
          invitation.id
        }
        invitationPublicId={
          invitation.public_id
        }
        eventId={
          invitation.event_id
        }
        recipients={
          recipients
        }
        managementGuests={
          managementGuests
        }
        questions={
          rsvpQuestions
        }
        availableGuests={
          availableGuests
        }
        groups={
          guestsData.groups
        }
      />
    </>
  );
}