"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  inviteEventCollaborator,
} from "@/features/event-collaboration/repositories/inviteEventCollaborator";

import type {
  InviteEventCollaboratorInput,
  InviteEventCollaboratorResult,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Invite Event Collaborator Action
========================================================================== */

export async function inviteEventCollaboratorAction(
  input: InviteEventCollaboratorInput
): Promise<ActionResult<InviteEventCollaboratorResult>> {
  try {
    const invitation =
      await inviteEventCollaborator(
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
          : "Nije moguće poslati poziv za suradnju.",
    };
  }
}