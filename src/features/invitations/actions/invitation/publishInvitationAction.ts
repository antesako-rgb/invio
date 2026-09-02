"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  publishInvitation,
} from "@/features/invitations/repositories/invitation/publishInvitation";

import type {
  Invitation,
  PublishInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Publish Invitation Action
========================================================================== */

export async function publishInvitationAction(
  input: PublishInvitationInput
): Promise<ActionResult<Invitation>> {
  try {
    const invitation =
      await publishInvitation(
        input
      );

    return {
      success: true,
      data: invitation,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće objaviti pozivnicu.",
    };
  }
}