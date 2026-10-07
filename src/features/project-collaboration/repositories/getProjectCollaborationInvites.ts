import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  ProjectCollaborationInvite,
} from "../types/projectCollaboration.types";


/* ==========================================================================
   Get Project Collaboration Invitations
========================================================================== */

export async function getProjectCollaborationInvites(
  projectId: string
): Promise<ProjectCollaborationInvite[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "project_collaboration_invites"
      )
      .select("id,project_id,email,invited_by,status,expires_at,responded_at,created_at,updated_at")
      .eq(
        "project_id",
        projectId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw error;
  }

  return data;
}
