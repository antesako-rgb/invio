import {
  supabase,
} from "@/lib/supabase/client";

import type {
  CreateEventGuestInput,
  EventGuest,
} from "../types/guest.types";


/* ==========================================================================
   Create Event Guest
========================================================================== */

export async function createEventGuest(
  input: CreateEventGuestInput
): Promise<EventGuest> {
  const {
    data,
    error,
  } =
    await supabase
      .from("event_guests")
      .insert(input)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}