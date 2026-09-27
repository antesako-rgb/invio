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
   Get Events
========================================================================== */

export async function getEvents(): Promise<Event[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order(
        "start_date",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    mapEvent
  );
}