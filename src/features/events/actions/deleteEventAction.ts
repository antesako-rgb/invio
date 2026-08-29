"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteEvent,
} from "@/features/events/repositories/deleteEvent";

import type {
  DeleteEventInput,
} from "@/features/events/types/event.types";


/* ==========================================================================
   Delete Event Action
========================================================================== */

export async function deleteEventAction(
  input: DeleteEventInput
): Promise<ActionResult> {
  try {
    await deleteEvent(
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
          : "Nije moguće obrisati događaj.",
    };
  }
}