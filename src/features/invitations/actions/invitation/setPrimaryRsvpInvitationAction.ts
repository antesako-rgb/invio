"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  setPrimaryRsvpInvitation,
} from "@/features/invitations/repositories/invitation/setPrimaryRsvpInvitation";

import type {
  Invitation,
  SetPrimaryRsvpInvitationInput,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Set Primary RSVP Invitation Action
========================================================================== */

export async function setPrimaryRsvpInvitationAction(
  input: SetPrimaryRsvpInvitationInput
): Promise<ActionResult<Invitation>> {
  try {
    const invitation =
      await setPrimaryRsvpInvitation(
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
          : "Nije moguće postaviti glavnu RSVP pozivnicu.",
    };
  }
}