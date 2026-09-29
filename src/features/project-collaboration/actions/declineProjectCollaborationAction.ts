"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  declineProjectCollaborationInvite,
} from "@/features/project-collaboration/repositories/declineProjectCollaborationInvite";

import type {
  DeclineProjectCollaborationInviteInput,
} from "@/features/project-collaboration/types/projectCollaboration.types";


/* ==========================================================================
   Decline Project Collaboration Action
========================================================================== */

export async function declineProjectCollaborationAction(
  input: DeclineProjectCollaborationInviteInput
): Promise<ActionResult<string>> {
  try {
    const projectId =
      await declineProjectCollaborationInvite(
        input
      );

    return {
      success: true,
      data: projectId,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće odbiti poziv za suradnju.",
    };
  }
}