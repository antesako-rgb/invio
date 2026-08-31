import FloraCard
  from "@/features/invitations/cards/flora/FloraCard";

import PortraitCard
  from "@/features/invitations/cards/portrait/PortraitCard";

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

    portrait:
      PortraitCard,
  };