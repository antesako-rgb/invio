"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  setPrimaryRsvpInvitation,
} from "@/features/invitations/repositories/experience/setPrimaryRsvpInvitation";

import type {
  EventExperience,
  SetPrimaryRsvpInvitationInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Set Primary RSVP Invitation Action
========================================================================== */

export async function setPrimaryRsvpInvitationAction(
  input: SetPrimaryRsvpInvitationInput
): Promise<ActionResult<EventExperience>> {
  try {
    const experience =
      await setPrimaryRsvpInvitation(
        input
      );

    return {
      success:
        true,

      data:
        experience,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće postaviti glavnu RSVP pozivnicu.",
    };
  }
}