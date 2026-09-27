"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  declineEventCollaborationInvite,
} from "@/features/event-collaboration/repositories/declineEventCollaborationInvite";

import type {
  DeclineEventCollaborationInviteInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Decline Event Collaboration Action
========================================================================== */

export async function declineEventCollaborationAction(
  input: DeclineEventCollaborationInviteInput
): Promise<ActionResult<string>> {
  try {
    const eventId =
      await declineEventCollaborationInvite(
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