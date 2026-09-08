import CelesteCard
  from "@/features/invitations/cards/templates/wedding/celeste/invitation/CelesteCard";

import FloraCard
  from "@/features/invitations/cards/templates/wedding/flora/invitation/FloraCard";

import GardenGraceCard
  from "@/features/invitations/cards/templates/wedding/garden-grace/invitation/GardenGraceCard";

import GardenGraceSaveTheDateCard
  from "@/features/invitations/cards/templates/wedding/garden-grace/save-the-date/GardenGraceSaveTheDateCard";

import PortraitCard
  from "@/features/invitations/cards/templates/wedding/portrait/invitation/PortraitCard";

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

    "garden-grace":
      GardenGraceCard,

    "garden-grace-save-the-date":
      GardenGraceSaveTheDateCard,

    portrait:
      PortraitCard,
  };