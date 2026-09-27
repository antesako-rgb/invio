"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  cancelEventCollaborationInvite,
} from "@/features/event-collaboration/repositories/cancelEventCollaborationInvite";

import type {
  CancelEventCollaborationInviteInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Cancel Event Collaboration Action
========================================================================== */

export async function cancelEventCollaborationAction(
  input: CancelEventCollaborationInviteInput
): Promise<ActionResult<string>> {
  try {
    const eventId =
      await cancelEventCollaborationInvite(
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