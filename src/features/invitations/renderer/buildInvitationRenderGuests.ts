import type {
  InvitationRenderGuest,
} from "@/features/invitations/types/invitationRenderer.types";

import type {
  PublicInvitationRecipientGuest,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Build Invitation Render Guests
========================================================================== */

export function buildInvitationRenderGuests(
  guests: PublicInvitationRecipientGuest[]
): InvitationRenderGuest[] {
  return guests.map(
    (guest) => ({
      id:
        guest.id,

      firstName:
        guest.first_name,

      lastName:
        guest.last_name,

      isPrimaryRecipient:
        guest.is_primary_recipient,
    })
  );
}