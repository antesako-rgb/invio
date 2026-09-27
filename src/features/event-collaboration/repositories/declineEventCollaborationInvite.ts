import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeclineEventCollaborationInviteInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Decline Event Collaboration Invitation
========================================================================== */

export async function declineEventCollaborationInvite(
  input: DeclineEventCollaborationInviteInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "decline_event_collaboration_invite",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}