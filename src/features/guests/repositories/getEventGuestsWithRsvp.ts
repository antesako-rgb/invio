import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventGuestWithRsvp,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Get Event Guests With RSVP
========================================================================== */

export async function getEventGuestsWithRsvp(
  eventId:
    string
): Promise<EventGuestWithRsvp[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_event_guests_with_rsvp",
      {
        p_event_id:
          eventId,
      }
    );

  if (
    error
  ) {
    throw error;
  }

  return data as
    EventGuestWithRsvp[];
}