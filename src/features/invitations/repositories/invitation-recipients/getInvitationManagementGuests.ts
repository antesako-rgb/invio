import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetInvitationManagementGuestsInput,
  InvitationManagementGuest,
} from "@/features/invitations/types/invitationManagement.types";


/* ==========================================================================
   Get Invitation Management Guests
========================================================================== */

export async function getInvitationManagementGuests(
  input:
    GetInvitationManagementGuestsInput
): Promise<InvitationManagementGuest[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_invitation_management_guests",
      {
        p_invitation_id:
          input.invitationId,
      }
    );

  if (error) {
    console.error(
      "getInvitationManagementGuests error:",
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
    InvitationManagementGuest[];
}