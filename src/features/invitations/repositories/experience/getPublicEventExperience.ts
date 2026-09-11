import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPublicEventExperienceInput,
  PublicEventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Get Public Event Experience
========================================================================== */

export async function getPublicEventExperience(
  input:
    GetPublicEventExperienceInput
): Promise<PublicEventExperience | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_invitation",
      {
        p_public_id:
          input.publicId,
      }
    );

  if (error) {
    console.error(
      "getPublicEventExperience error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (
    !data ||
    data.length === 0
  ) {
    return null;
  }

  return data[0] as PublicEventExperience;
}