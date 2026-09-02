"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteInvitation,
} from "@/features/invitations/repositories/invitation/deleteInvitation";


/* ==========================================================================
   Types
========================================================================== */

interface DeleteInvitationActionInput {
  invitationId:
    string;

  eventId:
    string;
}


/* ==========================================================================
   Delete Invitation Action
========================================================================== */

export async function deleteInvitationAction({
  invitationId,
  eventId,
}: DeleteInvitationActionInput): Promise<
  ActionResult<null>
> {
  try {
    await deleteInvitation({
      p_invitation_id:
        invitationId,
    });

    revalidatePath(
      `/dashboard/dogadaji/${eventId}/pozivnice`
    );

    return {
      success:
        true,

      data:
        null,
    };
  } catch (error) {
    console.error(
      "Failed to delete invitation:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "DELETE_FAILED",
    };
  }
}