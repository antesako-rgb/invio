import "server-only";

import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  Project,
} from "../types/project.types";

import {
  getProject,
} from "./getProject";


/* ==========================================================================
   Require Project Owner
========================================================================== */

export async function requireProjectOwner(
  projectId: string
): Promise<Project> {
  const supabase =
    await createServerClient();

  const [
    project,
    {
      data: {
        user,
      },
      error,
    },
  ] =
    await Promise.all([
      getProject(projectId),
      supabase.auth.getUser(),
    ]);

  if (
    error ||
    !user ||
    !project ||
    project.owner_id !== user.id
  ) {
    throw new Error(
      "UNAUTHORIZED"
    );
  }

  return project;
}