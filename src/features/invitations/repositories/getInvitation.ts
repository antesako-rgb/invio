import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Get Invitation
========================================================================== */

export async function getInvitation(
  invitationId: string
): Promise<Invitation | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("invitations")
      .select("*")
      .eq(
        "id",
        invitationId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "getInvitation error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data;
}