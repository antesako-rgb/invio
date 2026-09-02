import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Types
========================================================================== */

interface UpdateInvitationNameInput {
  p_invitation_id:
    string;

  p_name:
    string;
}


/* ==========================================================================
   Update Invitation Name
========================================================================== */

export async function updateInvitationName(
  input: UpdateInvitationNameInput
): Promise<Invitation> {
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
      "updateInvitationName error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Pozivnica nije ažurirana."
    );
  }

  return data;
}