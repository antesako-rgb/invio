import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CancelEventCollaborationInviteInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Cancel Event Collaboration Invitation
========================================================================== */

export async function cancelEventCollaborationInvite(
  input: CancelEventCollaborationInviteInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "cancel_event_collaboration_invite",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}