import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Database,
} from "@/lib/supabase/database.types";

import type {
  Event,
  UpdateEventInput,
} from "../types/event.types";

import {
  mapEvent,
} from "./mapEvent";


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
      input as unknown as Database["public"]["Functions"]["update_event"]["Args"]
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Event RPC returned no event."
    );
  }

  return mapEvent(
    data
  );
}