import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  UpdateInvitationInput,
} from "../../types/invitation.types";


/* ==========================================================================
   Update Invitation
========================================================================== */

export async function updateInvitation(
  input: UpdateInvitationInput
) {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_invitation",
      input
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Invitation operation failed"
    );
  }

  return data;
}