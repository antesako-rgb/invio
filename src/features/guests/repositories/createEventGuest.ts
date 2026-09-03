import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateEventGuestInput,
  EventGuest,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Create Event Guest
========================================================================== */

export async function createEventGuest(
  input: CreateEventGuestInput
): Promise<EventGuest> {
  const supabase =
    await createServerClient();


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
    console.error(
      "createEventGuest error:",
      error
    );

    throw new Error(
      error.message
    );
  }


  return data;
}