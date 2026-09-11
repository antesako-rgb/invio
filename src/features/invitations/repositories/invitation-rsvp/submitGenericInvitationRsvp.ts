import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  SubmitGenericInvitationRsvpInput,
} from "@/features/invitations/types/invitationRsvp.types";


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
   Submit Generic Invitation RSVP
========================================================================== */

export async function submitGenericInvitationRsvp(
  input:
    SubmitGenericInvitationRsvpInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "submit_generic_invitation_rsvp",
      {
        p_invitation_public_id:
          input.invitationPublicId,

        p_guests:
          toJson(
            input.guests
          ),
      }
    );

  if (error) {
    console.error(
      "submitGenericInvitationRsvp error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}