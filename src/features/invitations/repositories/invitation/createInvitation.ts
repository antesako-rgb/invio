import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateInvitationInput,
} from "../../types/invitation.types";


/* ==========================================================================
   Create Invitation
========================================================================== */

export async function createInvitation(
  input: CreateInvitationInput
) {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_invitation",
      input
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Invitation was not created"
    );
  }

  return data;
}