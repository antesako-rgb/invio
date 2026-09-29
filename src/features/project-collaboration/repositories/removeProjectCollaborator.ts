import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  RemoveProjectCollaboratorInput,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Remove Project Collaborator
========================================================================== */

export async function removeProjectCollaborator(
  input: RemoveProjectCollaboratorInput
): Promise<void> {
  const supabase =
    await createServerClient();

  const {
    error,
  } =
    await supabase.rpc(
      "remove_project_collaborator",
      input
    );

  if (error) {
    throw error;
  }
}