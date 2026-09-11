import CelesteCard
  from "@/features/invitations/cards/templates/wedding/celeste/invitation/CelesteCard";

import {
  celesteTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/celeste/invitation/CelesteTemplateConfig";

import FloraCard
  from "@/features/invitations/cards/templates/wedding/flora/invitation/FloraCard";

import {
  floraTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/flora/invitation/FloraTemplateConfig";

import GardenGraceCard
  from "@/features/invitations/cards/templates/wedding/garden-grace/invitation/GardenGraceCard";

import {
  gardenGraceTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/garden-grace/invitation/GardenGraceTemplateConfig";

import GardenGracePhotoWallCard
  from "@/features/invitations/cards/templates/wedding/garden-grace/photo-wall/GardenGracePhotoWallCard";

import {
  gardenGracePhotoWallTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/garden-grace/photo-wall/GardenGracePhotoWallTemplateConfig";

import GardenGraceSaveTheDateCard
  from "@/features/invitations/cards/templates/wedding/garden-grace/save-the-date/GardenGraceSaveTheDateCard";

import {
  gardenGraceSaveTheDateTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/garden-grace/save-the-date/GardenGraceSaveTheDateTemplateConfig";

import PortraitCard
  from "@/features/invitations/cards/templates/wedding/portrait/invitation/PortraitCard";

import {
  portraitTemplateConfig,
} from "@/features/invitations/cards/templates/wedding/portrait/invitation/PortraitTemplateConfig";

import type {
  EventExperienceTemplateDefinition,
} from "@/features/invitations/types/eventExperienceTemplate.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

export type EventExperienceTemplateRegistry =
  Partial<
    Record<
      EventExperienceType,
      Record<
        string,
        EventExperienceTemplateDefinition
      >
    >
  >;


/* ==========================================================================
   Event Experience Template Registry
========================================================================== */

export const eventExperienceTemplateRegistry:
  EventExperienceTemplateRegistry = {
    invitation: {
      celeste: {
        config:
          celesteTemplateConfig,

        component:
          CelesteCard,
      },

      flora: {
        config:
          floraTemplateConfig,

        component:
          FloraCard,
      },

      "garden-grace": {
        config:
          gardenGraceTemplateConfig,

        component:
          GardenGraceCard,
      },

      portrait: {
        config:
          portraitTemplateConfig,

        component:
          PortraitCard,
      },
    },

    "save-the-date": {
      "garden-grace": {
        config:
          gardenGraceSaveTheDateTemplateConfig,

        component:
          GardenGraceSaveTheDateCard,
      },
    },

    "photo-wall": {
      "garden-grace": {
        config:
          gardenGracePhotoWallTemplateConfig,

        component:
          GardenGracePhotoWallCard,
      },
    },
  };