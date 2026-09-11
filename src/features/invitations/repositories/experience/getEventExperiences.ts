import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Get Event Experiences
========================================================================== */

export async function getEventExperiences(
  eventId:
    string
): Promise<EventExperience[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("invitations")
      .select("*")
      .eq(
        "event_id",
        eventId
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    console.error(
      "getEventExperiences error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return (data ?? []) as
    EventExperience[];
}