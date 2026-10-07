"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createProject,
} from "../repositories/createProject";

import type {
  CreateProjectInput,
  Project,
} from "../types/project.types";

/* ==========================================================================
 Create Project Action
========================================================================== */

export async function createProjectAction(
  input:
    CreateProjectInput
): Promise<ActionResult<Project>> {
  try {
    const project = await createProject(
      input
    );
    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );
    return {
      success:
        true,

      data:
        project,
    };
  } catch (error) {
    console.error(
      "createProjectAction failed:",
      error
    );
    return {
      success:
        false,

      code:
        "PROJECT_CREATE_FAILED",
    };
  }
}
