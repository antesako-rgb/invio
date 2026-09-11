import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Event,
} from "@/features/events/types/event.types";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorData {
  experience:
    EventExperience;

  event:
    Event;
}


/* ==========================================================================
   Get Event Experience Editor Data
========================================================================== */

export async function getEventExperienceEditorData(
  experienceId: string
): Promise<EventExperienceEditorData | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("invitations")
      .select(`
        *,
        event:events (
          *
        )
      `)
      .eq(
        "id",
        experienceId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "getEventExperienceEditorData error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    return null;
  }

  return {
    experience:
      data as EventExperience,

    event:
      data.event,
  };
}