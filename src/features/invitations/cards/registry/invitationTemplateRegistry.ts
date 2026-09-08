import {
  celesteTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/celeste/invitation/CelesteTemplateConfig";

import {
  floraTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/flora/invitation/FloraTemplateConfig";

import {
  gardenGraceTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/garden-grace/invitation/GardenGraceTemplateConfig";

import {
  gardenGraceSaveTheDateTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/garden-grace/save-the-date/GardenGraceSaveTheDateTemplateConfig";

import {
  portraitTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/portrait/invitation/PortraitTemplateConfig";

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

    "garden-grace":
      gardenGraceTemplateConfig,

    "garden-grace-save-the-date":
      gardenGraceSaveTheDateTemplateConfig,

    portrait:
      portraitTemplateConfig,
  };