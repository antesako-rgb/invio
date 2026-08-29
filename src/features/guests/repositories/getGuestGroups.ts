import {
  supabase,
} from "@/lib/supabase/client";

import type {
  GuestGroup,
} from "../types/guest.types";


/* ==========================================================================
   Get Guest Groups
========================================================================== */

export async function getGuestGroups(
  eventId: string
): Promise<GuestGroup[]> {
  const {
    data,
    error,
  } =
    await supabase
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
      );

  if (error) {
    throw error;
  }

  return data;
}