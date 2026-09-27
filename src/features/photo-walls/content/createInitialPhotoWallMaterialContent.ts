import type {
  Event,
} from "@/features/events/types/event.types";

import {
  createDefaultPhotoWallMaterialContent,
} from "@/features/photo-walls/content/createDefaultPhotoWallMaterialContent";

import type {
  PhotoWallMaterialContent,
} from "@/features/photo-walls/types/photoWallMaterialContent.types";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallMaterialContentDefaults {
  primaryName:
    string | null;

  secondaryName:
    string | null;

  heroTitle:
    string | null;

  heroSubtitle:
    string | null;

  firstInitial:
    string | null;

  secondInitial:
    string | null;

  description:
    string | null;
}


/* ==========================================================================
   Create Initial Photo Wall Material Content
========================================================================== */

export function createInitialPhotoWallMaterialContent(
  event:
    Event,

  defaults:
    PhotoWallMaterialContentDefaults
): PhotoWallMaterialContent {
  const content =
    createDefaultPhotoWallMaterialContent();

  return {
    ...content,

    hero: {
      ...content.hero,

      primary_name:
        defaults.primaryName,

      secondary_name:
        defaults.secondaryName,

      title:
        defaults.heroTitle,

      subtitle:
        defaults.heroSubtitle,

      first_initial:
        defaults.firstInitial,

      second_initial:
        defaults.secondInitial,
    },

    description:
      defaults.description,

    date: {
      ...content.date,

      start_date:
        event.start_date,
    },

    time: {
      ...content.time,

      start_time:
        event.start_time,
    },

    location: {
      ...content.location,

      name:
        event.location_name,

      address:
        event.location_address,
    },
  };
}