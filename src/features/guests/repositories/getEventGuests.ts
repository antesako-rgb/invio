import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventGuest,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Get Event Guests
========================================================================== */

export async function getEventGuests(
  eventId:
    string
): Promise<EventGuest[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "event_guests"
      )
      .select(
        "*"
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
      );

  if (
    error
  ) {
    throw error;
  }

  return data;
}