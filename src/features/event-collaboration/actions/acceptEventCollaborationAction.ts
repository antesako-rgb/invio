"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  acceptEventCollaborationInvitation,
} from "@/features/event-collaboration/repositories/acceptEventCollaborationInvitation";

import type {
  AcceptEventCollaborationInvitationInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Accept Event Collaboration Action
========================================================================== */

export async function acceptEventCollaborationAction(
  input: AcceptEventCollaborationInvitationInput
): Promise<ActionResult<string>> {
  try {
    const eventId =
      await acceptEventCollaborationInvitation(
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
          : "Nije moguće prihvatiti poziv za suradnju.",
    };
  }
}