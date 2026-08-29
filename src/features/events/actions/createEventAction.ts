"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createEvent,
} from "@/features/events/repositories/createEvent";

import type {
  CreateEventInput,
  Event,
} from "@/features/events/types/event.types";


/* ==========================================================================
   Create Event Action
========================================================================== */

export async function createEventAction(
  input: CreateEventInput
): Promise<ActionResult<Event>> {
  try {
    const event =
      await createEvent(
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
          : "Nije moguće kreirati događaj.",
    };
  }
}