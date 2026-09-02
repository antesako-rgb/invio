import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPublicInvitationRecipientInput,
  PublicInvitationRecipient,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Get Public Invitation Recipient
========================================================================== */

export async function getPublicInvitationRecipient(
  input: GetPublicInvitationRecipientInput
): Promise<PublicInvitationRecipient | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_invitation_recipient",
      input
    );

  if (error) {
    console.error(
      "getPublicInvitationRecipient error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    return null;
  }

  return data as unknown as
    PublicInvitationRecipient;
}