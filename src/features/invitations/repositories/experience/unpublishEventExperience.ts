import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventExperience,
  UnpublishEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Unpublish Event Experience
========================================================================== */

export async function unpublishEventExperience(
  input:
    UnpublishEventExperienceInput
): Promise<EventExperience> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "unpublish_invitation",
      {
        p_invitation_id:
          input.experienceId,
      }
    );

  if (error) {
    console.error(
      "unpublishEventExperience error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Event experience nije uklonjen iz objave."
    );
  }

  return data as EventExperience;
}