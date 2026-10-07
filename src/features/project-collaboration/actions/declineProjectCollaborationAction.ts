"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  input:
    DeclineProjectCollaborationInviteInput
): Promise<ActionResult<string>> {
  if (!z.string().trim().min(1).max(2048).safeParse(input?.p_token).success) {
    return { success: false, code: "INVALID_INPUT" };
  }
  try {
    const projectId = await declineProjectCollaborationInvite(
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
      "declineProjectCollaborationAction failed:",
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
