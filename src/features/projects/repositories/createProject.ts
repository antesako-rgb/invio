import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  CreateProjectInput,
  Project,
} from "../types/project.types";


/* ==========================================================================
   Create Project
========================================================================== */

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_project",
      input
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Project RPC returned no project."
    );
  }

  return data;
}