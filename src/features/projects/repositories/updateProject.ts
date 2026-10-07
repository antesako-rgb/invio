import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Project,
  UpdateProjectInput,
} from "../types/project.types";


/* ==========================================================================
   Update Project
========================================================================== */

export async function updateProject(
  input: UpdateProjectInput
): Promise<Project> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_project",
      input
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Update Project RPC returned no project."
    );
  }

  return data;
}