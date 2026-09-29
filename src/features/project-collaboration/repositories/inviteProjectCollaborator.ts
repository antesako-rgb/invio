import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  InviteProjectCollaboratorInput,
  InviteProjectCollaboratorResult,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Invite Project Collaborator
========================================================================== */

export async function inviteProjectCollaborator(
  input: InviteProjectCollaboratorInput
): Promise<InviteProjectCollaboratorResult> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "invite_project_collaborator",
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