"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  unpublishInvitation,
} from "@/features/invitations/repositories/unpublishInvitation";

import type {
  Invitation,
  UnpublishInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Unpublish Invitation Action
========================================================================== */

export async function unpublishInvitationAction(
  input: UnpublishInvitationInput
): Promise<ActionResult<Invitation>> {
  try {
    const invitation =
      await unpublishInvitation(
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
          : "Nije moguće ukloniti objavu pozivnice.",
    };
  }
}