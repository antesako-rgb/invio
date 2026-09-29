"use server";

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
  input: RemoveProjectCollaboratorInput
): Promise<ActionResult> {
  try {
    await removeProjectCollaborator(
      input
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ukloniti suradnika.",
    };
  }
}