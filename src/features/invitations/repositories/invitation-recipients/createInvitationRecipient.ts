import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateInvitationRecipientInput,
  InvitationRecipient,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Create Invitation Recipient
========================================================================== */

export async function createInvitationRecipient(
  input:
    CreateInvitationRecipientInput
): Promise<InvitationRecipient> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_invitation_recipient",
      {
        p_invitation_id:
          input.invitationId,

        p_guest_ids:
          input.guestIds,

        p_primary_guest_id:
          input.primaryGuestId,
      }
    );

  if (error) {
    console.error(
      "createInvitationRecipient error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Primatelj pozivnice nije kreiran."
    );
  }

  return data;
}