"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  removeEventCollaborator,
} from "@/features/event-collaboration/repositories/removeEventCollaborator";

import type {
  RemoveEventCollaboratorInput,
} from "@/features/event-collaboration/types/eventCollaboration.types";


/* ==========================================================================
   Remove Event Collaborator Action
========================================================================== */

export async function removeEventCollaboratorAction(
  input: RemoveEventCollaboratorInput
): Promise<ActionResult> {
  try {
    await removeEventCollaborator(
      input
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ukloniti suradnika.",
    };
  }
}