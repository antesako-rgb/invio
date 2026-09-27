"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  acceptEventCollaborationInvite,
} from "@/features/event-collaboration/repositories/acceptEventCollaborationInvite";

import type {
  AcceptEventCollaborationInviteInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Accept Event Collaboration Action
========================================================================== */

export async function acceptEventCollaborationAction(
  input: AcceptEventCollaborationInviteInput
): Promise<ActionResult<string>> {
  try {
    const eventId =
      await acceptEventCollaborationInvite(
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