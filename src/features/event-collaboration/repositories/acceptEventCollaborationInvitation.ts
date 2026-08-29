import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  AcceptEventCollaborationInvitationInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Accept Event Collaboration Invitation
========================================================================== */

export async function acceptEventCollaborationInvitation(
  input: AcceptEventCollaborationInvitationInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "accept_event_collaboration_invitation",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}