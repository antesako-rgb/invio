import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getEventGuestsWithRsvp,
} from "@/features/guests/repositories/getEventGuestsWithRsvp";

import type {
  EventGuestWithRsvp,
  GuestGroup,
  GuestRsvpInvitation,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventGuestsPageData {
  guests:
    EventGuestWithRsvp[];

  groups:
    GuestGroup[];

  rsvpInvitations:
    GuestRsvpInvitation[];
}


/* ==========================================================================
   Get Event Guests Page Data
========================================================================== */

export async function getEventGuestsPageData(
  eventId:
    string
): Promise<EventGuestsPageData> {
  const supabase =
    await createServerClient();

  const [
    guests,
    groupsResult,
    rsvpInvitationsResult,
  ] =
    await Promise.all([
      getEventGuestsWithRsvp(
        eventId
      ),

      supabase
        .from(
          "guest_groups"
        )
        .select(
          "*"
        )
        .eq(
          "event_id",
          eventId
        )
        .order(
          "name",
          {
            ascending:
              true,
          }
        ),

      supabase
        .from(
          "invitations"
        )
        .select(
          "id, name, is_primary_rsvp"
        )
        .eq(
          "event_id",
          eventId
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          }
        ),
    ]);

  if (
    groupsResult.error
  ) {
    throw groupsResult.error;
  }

  if (
    rsvpInvitationsResult.error
  ) {
    throw rsvpInvitationsResult.error;
  }

  return {
    guests,

    groups:
      groupsResult.data,

    rsvpInvitations:
      rsvpInvitationsResult.data,
  };
}