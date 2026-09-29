"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  acceptProjectCollaborationInvite,
} from "@/features/project-collaboration/repositories/acceptProjectCollaborationInvite";

import type {
  AcceptProjectCollaborationInviteInput,
} from "@/features/project-collaboration/types/projectCollaboration.types";


/* ==========================================================================
   Accept Project Collaboration Action
========================================================================== */

export async function acceptProjectCollaborationAction(
  input: AcceptProjectCollaborationInviteInput
): Promise<ActionResult<string>> {
  try {
    const projectId =
      await acceptProjectCollaborationInvite(
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
          : "Nije moguće prihvatiti poziv za suradnju.",
    };
  }
}