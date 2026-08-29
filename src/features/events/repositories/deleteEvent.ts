import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeleteEventInput,
} from "../types/event.types";


/* ==========================================================================
   Delete Event
========================================================================== */

export async function deleteEvent(
  input: DeleteEventInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "delete_event",
      input
    );

  if (error) {
    throw error;
  }
}