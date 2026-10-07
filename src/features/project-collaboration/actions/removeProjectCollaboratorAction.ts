"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  removeProjectCollaborator,
} from "@/features/project-collaboration/repositories/removeProjectCollaborator";

import type {
  RemoveProjectCollaboratorInput,
} from "@/features/project-collaboration/types/projectCollaboration.types";

/* ==========================================================================
 Remove Project Collaborator Action
========================================================================== */

export async function removeProjectCollaboratorAction(
  input:
    RemoveProjectCollaboratorInput
): Promise<ActionResult> {
  if (!z.object({ p_project_id: z.string().uuid(), p_profile_id: z.string().uuid() }).safeParse(input).success) {
    return { success: false, code: "INVALID_INPUT" };
  }
  try {
    await removeProjectCollaborator(
      input
    );
    revalidatePath("/[locale]/dashboard", "layout");
    return {
      success:
        true,
    };
  } catch (error) {
    console.error(
      "removeProjectCollaboratorAction failed:",
      error
    );
    return {
      success:
        false,

      code:
        "COLLABORATION_FAILED",
    };
  }
}
