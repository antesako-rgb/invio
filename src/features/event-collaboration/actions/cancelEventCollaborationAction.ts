"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  cancelEventCollaborationInvitation,
} from "@/features/event-collaboration/repositories/cancelEventCollaborationInvitation";

import type {
  CancelEventCollaborationInvitationInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Cancel Event Collaboration Action
========================================================================== */

export async function cancelEventCollaborationAction(
  input: CancelEventCollaborationInvitationInput
): Promise<ActionResult<string>> {
  try {
    const eventId =
      await cancelEventCollaborationInvitation(
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
          : "Nije moguće otkazati poziv za suradnju.",
    };
  }
}