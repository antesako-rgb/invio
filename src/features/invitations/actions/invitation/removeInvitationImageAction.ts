"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  removeInvitationImage,
} from "@/features/invitations/repositories/invitation/removeInvitationImage";


/* ==========================================================================
   Remove Invitation Image Action
========================================================================== */

export async function removeInvitationImageAction(
  invitationId: string,
  imageUrl: string
): Promise<ActionResult<null>> {
  try {
    await removeInvitationImage(
      invitationId,
      imageUrl
    );

    return {
      success:
        true,

      data:
        null,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Fotografiju nije moguće obrisati.",
    };
  }
}