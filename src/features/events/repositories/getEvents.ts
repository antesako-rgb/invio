import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Event,
} from "../types/event.types";


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
      .select("*")
      .order(
        "start_date",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return data;
}