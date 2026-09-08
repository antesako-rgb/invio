import CelesteCard
  from "@/features/invitations/cards/templates/wedding/celeste/CelesteCard";

import FloraCard
  from "@/features/invitations/cards/templates/wedding/flora/FloraCard";

import PortraitCard
  from "@/features/invitations/cards/templates/wedding/portrait/PortraitCard";

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
    celeste:
      CelesteCard,

    flora:
      FloraCard,

    portrait:
      PortraitCard,
  };