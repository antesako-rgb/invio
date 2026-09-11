import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  CreateEventExperienceInput,
  EventExperience,
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
   Create Event Experience
========================================================================== */

export async function createEventExperience(
  input:
    CreateEventExperienceInput
): Promise<EventExperience> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_invitation",
      {
        p_event_id:
          input.eventId,

        p_name:
          input.name,

        p_type:
          input.type,

        p_template_id:
          input.templateId,

        p_variant_id:
          input.variantId,

        ...(input.content !== undefined
          ? {
              p_content:
                toJson(
                  input.content
                ),
            }
          : {}),

        ...(input.presentation !== undefined
          ? {
              p_presentation:
                toJson(
                  input.presentation
                ),
            }
          : {}),
      }
    );

  if (error) {
    console.error(
      "createEventExperience error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Event experience nije kreiran."
    );
  }

  return data as EventExperience;
}