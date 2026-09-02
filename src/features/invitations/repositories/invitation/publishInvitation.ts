import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Invitation,
  PublishInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Publish Invitation
========================================================================== */

export async function publishInvitation(
  input: PublishInvitationInput
): Promise<Invitation> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "publish_invitation",
      input
    );

  if (error) {
    console.error(
      "publishInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Pozivnica nije objavljena."
    );
  }

  return data;
}