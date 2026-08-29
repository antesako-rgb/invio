import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  GetPublicInvitationInput,
  PublicInvitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Get Public Invitation
========================================================================== */

export async function getPublicInvitation(
  input: GetPublicInvitationInput
): Promise<PublicInvitation | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_public_invitation",
      input
    );

  if (error) {
    console.error(
      "getPublicInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data?.[0] ?? null;
}