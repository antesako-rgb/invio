"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  input:
    InviteProjectCollaboratorInput
): Promise<ActionResult<InviteProjectCollaboratorResult>> {
  const parsed = z.object({ p_project_id: z.string().uuid(), p_email: z.string().trim().email().max(320).toLowerCase() }).safeParse(input);
  if (!parsed.success) return { success: false, code: "INVALID_INPUT" };
  try {
    const invitation = await inviteProjectCollaborator(
      parsed.data
    );
    revalidatePath("/[locale]/dashboard", "layout");
    return {
      success:
        true,

      data:
        invitation,
    };
  } catch (error) {
    console.error(
      "inviteProjectCollaboratorAction failed:",
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
