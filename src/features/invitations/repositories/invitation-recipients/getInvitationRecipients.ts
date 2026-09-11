import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetInvitationRecipientsInput,
  InvitationRecipientDetails,
} from "@/features/invitations/types/invitationRecipient.types";


/* ==========================================================================
   Get Invitation Recipients
========================================================================== */

export async function getInvitationRecipients(
  input:
    GetInvitationRecipientsInput
): Promise<InvitationRecipientDetails[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_invitation_recipients",
      {
        p_invitation_id:
          input.invitationId,
      }
    );

  if (error) {
    console.error(
      "getInvitationRecipients error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    return [];
  }

  return data as unknown as
    InvitationRecipientDetails[];
}