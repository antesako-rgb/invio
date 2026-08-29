import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateEventInput,
  Event,
} from "../types/event.types";


/* ==========================================================================
   Create Event
========================================================================== */

export async function createEvent(
  input: CreateEventInput
): Promise<Event> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_event",
      input
    );

  if (error) {
    console.error(
      "createEvent error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Događaj nije kreiran."
    );
  }

  return data;
}