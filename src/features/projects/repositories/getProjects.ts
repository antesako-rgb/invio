import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Project,
} from "../types/project.types";


/* ==========================================================================
   Get Projects
========================================================================== */

export async function getProjects(): Promise<Project[]> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("projects")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .order(
        "id"
      );

  if (error) {
    throw error;
  }

  return data;
}