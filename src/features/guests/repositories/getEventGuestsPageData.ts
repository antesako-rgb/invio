import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventGuest,
  GuestGroup,
} from "../types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventGuestsPageData {
  guests:
    EventGuest[];

  groups:
    GuestGroup[];
}


/* ==========================================================================
   Get Event Guests Page Data
========================================================================== */

export async function getEventGuestsPageData(
  eventId: string
): Promise<EventGuestsPageData> {
  const supabase =
    await createServerClient();


  const [
    guestsResult,
    groupsResult,
  ] =
    await Promise.all([
      supabase
        .from("event_guests")
        .select("*")
        .eq(
          "event_id",
          eventId
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        ),

      supabase
        .from("guest_groups")
        .select("*")
        .eq(
          "event_id",
          eventId
        )
        .order(
          "name",
          {
            ascending: true,
          }
        ),
    ]);


  if (guestsResult.error) {
    throw guestsResult.error;
  }


  if (groupsResult.error) {
    throw groupsResult.error;
  }


  return {
    guests:
      guestsResult.data,

    groups:
      groupsResult.data,
  };
}