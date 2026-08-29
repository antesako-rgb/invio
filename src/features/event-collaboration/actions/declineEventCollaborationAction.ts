"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  declineEventCollaborationInvitation,
} from "@/features/event-collaboration/repositories/declineEventCollaborationInvitation";

import type {
  DeclineEventCollaborationInvitationInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Decline Event Collaboration Action
========================================================================== */

export async function declineEventCollaborationAction(
  input: DeclineEventCollaborationInvitationInput
): Promise<ActionResult<string>> {
  try {
    const eventId =
      await declineEventCollaborationInvitation(
        input
      );

    return {
      success: true,
      data: eventId,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće odbiti poziv za suradnju.",
    };
  }
}