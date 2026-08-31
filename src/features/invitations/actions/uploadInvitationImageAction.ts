"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  uploadInvitationImage,
} from "@/features/invitations/repositories/uploadInvitationImage";


/* ==========================================================================
   Upload Invitation Image Action
========================================================================== */

export async function uploadInvitationImageAction(
  file: File,
  invitationId: string
): Promise<ActionResult<string>> {
  try {
    const imageUrl =
      await uploadInvitationImage(
        file,
        invitationId
      );

    return {
      success:
        true,

      data:
        imageUrl,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Fotografiju nije moguće prenijeti.",
    };
  }
}