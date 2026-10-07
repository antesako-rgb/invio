"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  input:
    AcceptProjectCollaborationInviteInput
): Promise<ActionResult<string>> {
  if (!z.string().trim().min(1).max(2048).safeParse(input?.p_token).success) {
    return { success: false, code: "INVALID_INPUT" };
  }
  try {
    const projectId = await acceptProjectCollaborationInvite(
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
      "acceptProjectCollaborationAction failed:",
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
