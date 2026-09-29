"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  inviteProjectCollaborator,
} from "@/features/project-collaboration/repositories/inviteProjectCollaborator";

import type {
  InviteProjectCollaboratorInput,
  InviteProjectCollaboratorResult,
} from "@/features/project-collaboration/types/projectCollaboration.types";


/* ==========================================================================
   Invite Project Collaborator Action
========================================================================== */

export async function inviteProjectCollaboratorAction(
  input: InviteProjectCollaboratorInput
): Promise<ActionResult<InviteProjectCollaboratorResult>> {
  try {
    const invitation =
      await inviteProjectCollaborator(
        input
      );

    return {
      success: true,
      data: invitation,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće poslati poziv za suradnju.",
    };
  }
}