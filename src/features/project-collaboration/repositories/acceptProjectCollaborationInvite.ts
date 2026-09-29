import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  AcceptProjectCollaborationInviteInput,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Accept Project Collaboration Invitation
========================================================================== */

export async function acceptProjectCollaborationInvite(
  input: AcceptProjectCollaborationInviteInput
): Promise<string> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "accept_project_collaboration_invite",
      input
    );

  if (error) {
    throw error;
  }

  return data;
}