import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CancelProjectCollaborationInviteInput,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Cancel Project Collaboration Invitation
========================================================================== */

export async function cancelProjectCollaborationInvite(
  input: CancelProjectCollaborationInviteInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "cancel_project_collaboration_invite",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}