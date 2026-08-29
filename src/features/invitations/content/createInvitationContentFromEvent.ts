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
   Create Invitation Content From Event
========================================================================== */

export function createInvitationContentFromEvent(
  event: Event
): InvitationContent {
  const content =
    createDefaultInvitationContent();

  return {
    ...content,

    hero: {
      ...content.hero,

      title:
        event.name,
    },

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