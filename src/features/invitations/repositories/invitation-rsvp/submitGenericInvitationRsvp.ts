import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Json,
} from "@/lib/supabase/database.types";

import type {
  SubmitGenericInvitationRsvpData,
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
  input: SubmitGenericInvitationRsvpData
): Promise<void> {
  const supabase =
    await createServerClient();

  const rpcInput: SubmitGenericInvitationRsvpInput = {
    p_invitation_public_id:
      input.p_invitation_public_id,

    p_guests:
      toJson(
        input.p_guests
      ),
  };

  const {
    error,
  } =
    await supabase.rpc(
      "submit_generic_invitation_rsvp",
      rpcInput
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