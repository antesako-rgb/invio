import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeleteEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Delete Event Experience
========================================================================== */

export async function deleteEventExperience(
  input:
    DeleteEventExperienceInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "delete_invitation",
      {
        p_invitation_id:
          input.experienceId,
      }
    );

  if (error) {
    console.error(
      "deleteEventExperience error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}