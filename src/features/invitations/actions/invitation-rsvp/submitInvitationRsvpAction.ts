"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  submitInvitationRsvp,
} from "@/features/invitations/repositories/invitation-rsvp/submitInvitationRsvp";

import type {
  SubmitInvitationRsvpInput,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Submit Invitation RSVP Action
========================================================================== */

export async function submitInvitationRsvpAction(
  input:
    SubmitInvitationRsvpInput
): Promise<ActionResult<void>> {
  try {
    await submitInvitationRsvp(
      input
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće spremiti RSVP odgovor.",
    };
  }
}