"use server";

import {
  z,
} from "zod";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createInvitation,
} from "../../repositories/invitation/createInvitation";

/* ==========================================================================
   Server Action
========================================================================== */

export async function createInvitationAction(
  projectId:
    string,

  templateId:
    string
): Promise<ActionResult<{
  invitationId: string;
  name: string;
}>> {
  try {
    z.string().uuid().parse(
      projectId
    );
    z.string().uuid().parse(
      templateId
    );
    // RPC checks ownership and template activity, generates the name and copies the template.
    const invitation = await createInvitation(
      {
        p_project_id:
          projectId,

        p_template_id:
          templateId,
      }
    );
    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );
    return {
      success:
        true,

      data: {
        invitationId:
          invitation.id,

        name:
          invitation.name,
      },
    };
  } catch {
    return {
      success:
        false,

      code:
        "INVITATION_CREATE_FAILED",
    };
  }
}
