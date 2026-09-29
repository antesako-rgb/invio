import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  ProjectCollaborator,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Get Project Collaborators
========================================================================== */

export async function getProjectCollaborators(
  projectId: string
): Promise<ProjectCollaborator[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_project_collaborators",
      {
        p_project_id:
          projectId,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}