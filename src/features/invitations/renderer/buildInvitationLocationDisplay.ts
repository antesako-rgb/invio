import type {
  InvitationLocationContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationLocationDisplay,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Build Invitation Location Display
========================================================================== */

export function buildInvitationLocationDisplay(
  location: InvitationLocationContent
): InvitationLocationDisplay {
  const venueName =
    location.name ?? "";

  const address =
    location.address ?? "";

  return {
    hasLocation:
      Boolean(
        venueName ||
        address
      ),

    venueName,

    address,
  };
}