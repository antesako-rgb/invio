import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  AcceptEventCollaborationInviteInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Accept Event Collaboration Invitation
========================================================================== */

export async function acceptEventCollaborationInvite(
  input: AcceptEventCollaborationInviteInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "accept_event_collaboration_invite",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}