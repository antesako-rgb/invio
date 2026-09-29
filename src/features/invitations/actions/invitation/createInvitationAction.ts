"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  requireProjectOwner,
} from "@/features/projects/repositories/requireProjectOwner";

import {
  createInvitation,
} from "../../repositories/invitation/createInvitation";

import {
  getProjectInvitation,
} from "../../repositories/invitation/getProjectInvitation";


/* ==========================================================================
   Types
========================================================================== */

type CreateInvitationActionData = {
  invitationId: string;
};


/* ==========================================================================
   Create Invitation Action
========================================================================== */

export async function createInvitationAction(
  projectId: string
): Promise<
  ActionResult<CreateInvitationActionData>
> {
  try {
    const project =
      await requireProjectOwner(
        projectId
      );

    let invitation =
      await getProjectInvitation(
        projectId
      );

    if (!invitation) {
      try {
        invitation =
          await createInvitation({
            p_project_id:
              projectId,

            p_name:
              project.name,
          });
      } catch (error) {
        invitation =
          await getProjectInvitation(
            projectId
          );

        if (!invitation) {
          throw error;
        }
      }
    }

    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );

    return {
      success: true,
      data: {
        invitationId:
          invitation.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invitation creation failed.",
    };
  }
}