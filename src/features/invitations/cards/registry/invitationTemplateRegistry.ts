import {
  celesteTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/celeste/CelesteTemplateConfig";

import {
  floraTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/flora/FloraTemplateConfig";

import {
  portraitTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/portrait/PortraitTemplateConfig";

import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Invitation Template Registry
========================================================================== */

export const invitationTemplateRegistry:
  Record<string, InvitationTemplateConfig> = {
    celeste:
      celesteTemplateConfig,

    flora:
      floraTemplateConfig,

    portrait:
      portraitTemplateConfig,
  };