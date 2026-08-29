import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  InviteEventCollaboratorInput,
  InviteEventCollaboratorResult,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Invite Event Collaborator
========================================================================== */

export async function inviteEventCollaborator(
  input: InviteEventCollaboratorInput
): Promise<InviteEventCollaboratorResult> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "invite_event_collaborator",
      input
    );

  if (error) {
    throw error;
  }

  const invitation =
    data[0];

  if (!invitation) {
    throw new Error(
      "Poziv za suradnju nije kreiran."
    );
  }

  return invitation;
}