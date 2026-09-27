import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Event,
} from "../types/event.types";

import {
  EVENT_COLUMNS,
  mapEvent,
} from "./mapEvent";


/* ==========================================================================
   Get Event
========================================================================== */

export async function getEvent(
  eventId: string
): Promise<Event | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq(
        "id",
        eventId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? mapEvent(data)
    : null;
}