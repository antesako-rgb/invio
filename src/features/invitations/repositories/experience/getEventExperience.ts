import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Get Event Experience
========================================================================== */

export async function getEventExperience(
  experienceId: string
): Promise<EventExperience | null> {
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
        "id",
        experienceId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "getEventExperience error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data as EventExperience | null;
}