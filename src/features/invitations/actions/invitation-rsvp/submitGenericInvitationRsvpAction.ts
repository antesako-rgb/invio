"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  submitGenericInvitationRsvp,
} from "@/features/invitations/repositories/invitation-rsvp/submitGenericInvitationRsvp";

import type {
  SubmitGenericInvitationRsvpData,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Submit Generic Invitation RSVP Action
========================================================================== */

export async function submitGenericInvitationRsvpAction(
  input: SubmitGenericInvitationRsvpData
): Promise<ActionResult<void>> {
  try {
    await submitGenericInvitationRsvp(
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