"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateInvitationName,
} from "@/features/invitations/repositories/invitation/updateInvitationName";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Types
========================================================================== */

interface UpdateInvitationNameActionInput {
  invitationId:
    string;

  name:
    string;
}


/* ==========================================================================
   Update Invitation Name Action
========================================================================== */

export async function updateInvitationNameAction({
  invitationId,
  name,
}: UpdateInvitationNameActionInput): Promise<
  ActionResult<Invitation>
> {
  const normalizedName =
    name.trim();

  if (!normalizedName) {
    return {
      success:
        false,

      message:
        "INVALID_NAME",
    };
  }

  try {
    const invitation =
      await updateInvitationName({
        p_invitation_id:
          invitationId,

        p_name:
          normalizedName,
      });

    revalidatePath(
      `/dashboard/pozivnice/${invitationId}`
    );

    revalidatePath(
      `/dashboard/dogadaji/${invitation.event_id}/pozivnice`
    );

    return {
      success:
        true,

      data:
        invitation,
    };
  } catch (error) {
    console.error(
      "Failed to update invitation name:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "UPDATE_FAILED",
    };
  }
}