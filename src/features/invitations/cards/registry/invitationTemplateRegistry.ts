import {
  floraTemplateConfig,
} from "@/features/invitations/cards/flora/FloraTemplateConfig";

import {
  portraitTemplateConfig,
} from "@/features/invitations/cards/portrait/PortraitTemplateConfig";

import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Invitation Template Registry
========================================================================== */

export const invitationTemplateRegistry:
  Record<string, InvitationTemplateConfig> = {
    flora:
      floraTemplateConfig,

    portrait:
      portraitTemplateConfig,
  };