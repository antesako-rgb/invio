import type {
  Event,
} from "@/features/events/types/event.types";

import {
  createDefaultEventExperienceContent,
} from "@/features/invitations/content/createDefaultEventExperienceContent";

import type {
  EventExperienceContent,
} from "@/features/invitations/types/eventExperienceContent.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceContentDefaults {
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
   Create Initial Event Experience Content
========================================================================== */

export function createInitialEventExperienceContent(
  event:
    Event,

  defaults:
    EventExperienceContentDefaults
): EventExperienceContent {
  const content =
    createDefaultEventExperienceContent();

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

      end_date:
        event.end_date,
    },

    time: {
      ...content.time,

      start_time:
        event.start_time,

      end_time:
        event.end_time,
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