"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  cancelProjectCollaborationInvite,
} from "@/features/project-collaboration/repositories/cancelProjectCollaborationInvite";

import type {
  CancelProjectCollaborationInviteInput,
} from "@/features/project-collaboration/types/projectCollaboration.types";


/* ==========================================================================
   Cancel Project Collaboration Action
========================================================================== */

export async function cancelProjectCollaborationAction(
  input: CancelProjectCollaborationInviteInput
): Promise<ActionResult<string>> {
  try {
    const projectId =
      await cancelProjectCollaborationInvite(
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
          : "Nije moguće otkazati poziv za suradnju.",
    };
  }
}