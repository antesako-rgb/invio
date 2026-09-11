import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface UpdateEventExperienceNameInput {
  p_invitation_id:
    string;

  p_name:
    string;
}


/* ==========================================================================
   Update Event Experience Name
========================================================================== */

export async function updateEventExperienceName(
  input: UpdateEventExperienceNameInput
): Promise<EventExperience> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_invitation_name",
      {
        p_invitation_id:
          input.p_invitation_id,

        p_name:
          input.p_name,
      }
    );

  if (error) {
    console.error(
      "updateEventExperienceName error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Event experience nije ažuriran."
    );
  }

  return data as EventExperience;
}