"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateEvent,
} from "@/features/events/repositories/updateEvent";

import type {
  Event,
  UpdateEventInput,
} from "@/features/events/types/event.types";


/* ==========================================================================
   Update Event Action
========================================================================== */

export async function updateEventAction(
  input: UpdateEventInput
): Promise<ActionResult<Event>> {
  try {
    const event =
      await updateEvent(
        input
      );

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ažurirati događaj.",
    };
  }
}