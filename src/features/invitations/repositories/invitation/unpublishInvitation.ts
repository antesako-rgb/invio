import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Invitation,
  UnpublishInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Unpublish Invitation
========================================================================== */

export async function unpublishInvitation(
  input: UnpublishInvitationInput
): Promise<Invitation> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "unpublish_invitation",
      input
    );

  if (error) {
    console.error(
      "unpublishInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Objava pozivnice nije uklonjena."
    );
  }

  return data;
}