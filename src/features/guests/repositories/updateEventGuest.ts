import {
  supabase,
} from "@/lib/supabase/client";

import type {
  EventGuest,
  UpdateEventGuestInput,
} from "../types/guest.types";


/* ==========================================================================
   Update Event Guest
========================================================================== */

export async function updateEventGuest(
  guestId: string,
  changes: UpdateEventGuestInput
): Promise<EventGuest> {
  const {
    data,
    error,
  } =
    await supabase
      .from("event_guests")
      .update(changes)
      .eq(
        "id",
        guestId
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}