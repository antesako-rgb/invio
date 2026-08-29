import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CancelEventCollaborationInvitationInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Cancel Event Collaboration Invitation
========================================================================== */

export async function cancelEventCollaborationInvitation(
  input: CancelEventCollaborationInvitationInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "cancel_event_collaboration_invitation",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}