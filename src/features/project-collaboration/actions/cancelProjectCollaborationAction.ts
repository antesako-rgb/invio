"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  input:
    CancelProjectCollaborationInviteInput
): Promise<ActionResult<string>> {
  if (!z.string().uuid().safeParse(input?.p_invite_id).success) {
    return { success: false, code: "INVALID_INPUT" };
  }
  try {
    const projectId = await cancelProjectCollaborationInvite(
      input
    );
    revalidatePath("/[locale]/dashboard", "layout");
    return {
      success:
        true,

      data:
        projectId,
    };
  } catch (error) {
    console.error(
      "cancelProjectCollaborationAction failed:",
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
