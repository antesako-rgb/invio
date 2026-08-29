import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  RemoveEventCollaboratorInput,
} from "../types/eventCollaboration.types";


/* ==========================================================================
   Remove Event Collaborator
========================================================================== */

export async function removeEventCollaborator(
  input: RemoveEventCollaboratorInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "remove_event_collaborator",
      input
    );

  if (error) {
    throw error;
  }
}