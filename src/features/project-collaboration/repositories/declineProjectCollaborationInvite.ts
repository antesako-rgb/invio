import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeclineProjectCollaborationInviteInput,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Decline Project Collaboration Invitation
========================================================================== */

export async function declineProjectCollaborationInvite(
  input: DeclineProjectCollaborationInviteInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "decline_project_collaboration_invite",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}