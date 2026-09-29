import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Get Project Invitation
========================================================================== */

export async function getProjectInvitation(
  projectId: string
) {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "invitations"
      )
      .select(
        "*"
      )
      .eq(
        "project_id",
        projectId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}