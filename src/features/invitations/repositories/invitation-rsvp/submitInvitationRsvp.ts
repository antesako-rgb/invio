import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  SubmitInvitationRsvpInput,
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
   Submit Invitation RSVP
========================================================================== */

export async function submitInvitationRsvp(
  input:
    SubmitInvitationRsvpInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "submit_invitation_rsvp",
      {
        p_recipient_public_id:
          input.recipientPublicId,

        p_responses:
          toJson(
            input.responses
          ),
      }
    );

  if (error) {
    console.error(
      "submitInvitationRsvp error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}