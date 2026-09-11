import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  EventExperience,
  UpdateEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Helpers
========================================================================== */

function toJson(
  value: unknown
): Json {
  return JSON.parse(
    JSON.stringify(
      value
    )
  ) as Json;
}


/* ==========================================================================
   Update Event Experience
========================================================================== */

export async function updateEventExperience(
  input:
    UpdateEventExperienceInput
): Promise<EventExperience> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_invitation",
      {
        p_invitation_id:
          input.experienceId,

        p_name:
          input.name,

        p_template_id:
          input.templateId,

        p_variant_id:
          input.variantId,

        p_content:
          toJson(
            input.content
          ),

        p_presentation:
          toJson(
            input.presentation
          ),
      }
    );

  if (error) {
    console.error(
      "updateEventExperience error:",
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