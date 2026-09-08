import type {
  Event,
} from "@/features/events/types/event.types";

import type {
  InvitationContent,
} from "@/features/invitations/types/invitationContent.types";

import {
  createDefaultInvitationContent,
} from "@/features/invitations/content/createDefaultInvitationContent";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationContentDefaults {
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
   Create Initial Invitation Content
========================================================================== */

export function createInitialInvitationContent(
  event:
    Event,

  defaults:
    InvitationContentDefaults
): InvitationContent {
  const content =
    createDefaultInvitationContent();

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