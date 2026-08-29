import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DeclineEventCollaborationInvitationInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Decline Event Collaboration Invitation
========================================================================== */

export async function declineEventCollaborationInvitation(
  input: DeclineEventCollaborationInvitationInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "decline_event_collaboration_invitation",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}