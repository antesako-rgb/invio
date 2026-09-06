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

interface InvitationEventContentDefaults {
  heroSubtitle:
    string;

  description:
    string;
}


/* ==========================================================================
   Create Invitation Content From Event
========================================================================== */

export function createInvitationContentFromEvent(
  event: Event,
  defaults: InvitationEventContentDefaults
): InvitationContent {
  const content =
    createDefaultInvitationContent();

  return {
    ...content,

    hero: {
      ...content.hero,

      title:
        event.name,

      subtitle:
        defaults.heroSubtitle,
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