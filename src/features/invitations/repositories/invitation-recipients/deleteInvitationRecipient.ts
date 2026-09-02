import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeleteInvitationRecipientInput,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Delete Invitation Recipient
========================================================================== */

export async function deleteInvitationRecipient(
  input: DeleteInvitationRecipientInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "delete_invitation_recipient",
      input
    );

  if (error) {
    console.error(
      "deleteInvitationRecipient error:",
      error
    );

    throw new Error(
      error.message
    );
  }
}