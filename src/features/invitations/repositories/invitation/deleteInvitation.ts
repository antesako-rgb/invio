import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeleteInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Delete Invitation
========================================================================== */

export async function deleteInvitation(
  input:
    DeleteInvitationInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "delete_invitation",
      input
    );

  if (error) {
    console.error(
      "deleteInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}