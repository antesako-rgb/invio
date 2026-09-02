import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  SubmitInvitationRsvpData,
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
  input: SubmitInvitationRsvpData
): Promise<void> {
  const supabase =
    await createServerClient();

  const rpcInput: SubmitInvitationRsvpInput = {
    p_recipient_public_id:
      input.p_recipient_public_id,

    p_responses:
      toJson(
        input.p_responses
      ),
  };

  const {
    error,
  } =
    await supabase.rpc(
      "submit_invitation_rsvp",
      rpcInput
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