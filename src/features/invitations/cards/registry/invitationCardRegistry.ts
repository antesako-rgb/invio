import FloraCard
  from "@/features/invitations/cards/flora/FloraCard";

import type {
  InvitationTemplateComponent,
} from "@/features/invitations/types/invitationTemplate.types";


/* ==========================================================================
   Invitation Card Registry
========================================================================== */

export const invitationCardRegistry:
  Record<
    string,
    InvitationTemplateComponent
  > = {
    flora:
      FloraCard,
  };