import EventInvitationCard
  from "@/features/invitations/components/event-invitations/EventInvitationCard/EventInvitationCard";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import styles
  from "./EventInvitationsList.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventInvitationsListProps {
  invitations:
    Invitation[];
}


/* ==========================================================================
   Event Invitations List
========================================================================== */

export default function EventInvitationsList({
  invitations,
}: EventInvitationsListProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
    >
      {invitations.map(
        (invitation) => (
          <EventInvitationCard
            key={
              invitation.id
            }
            invitation={
              invitation
            }
          />
        )
      )}
    </div>
  );
}