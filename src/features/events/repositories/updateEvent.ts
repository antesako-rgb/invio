import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Event,
  UpdateEventInput,
} from "../types/event.types";


/* ==========================================================================
   Update Event
========================================================================== */

export async function updateEvent(
  input: UpdateEventInput
): Promise<Event> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_event",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}