import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventExperience,
  PublishEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Publish Event Experience
========================================================================== */

export async function publishEventExperience(
  input:
    PublishEventExperienceInput
): Promise<EventExperience> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "publish_invitation",
      {
        p_invitation_id:
          input.experienceId,
      }
    );

  if (error) {
    console.error(
      "publishEventExperience error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Event experience nije objavljen."
    );
  }

  return data as EventExperience;
}