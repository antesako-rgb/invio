import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Project,
} from "../types/project.types";


/* ==========================================================================
   Get Project
========================================================================== */

export async function getProject(
  projectId: string
): Promise<Project | null> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("projects")
      .select("*")
      .eq(
        "id",
        projectId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}