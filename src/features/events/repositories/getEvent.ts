import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Event,
} from "../types/event.types";


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
      .select("*")
      .eq(
        "id",
        eventId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}