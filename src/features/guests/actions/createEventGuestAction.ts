"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createEventGuest,
} from "@/features/guests/repositories/createEventGuest";

import type {
  CreateEventGuestInput,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface CreateEventGuestActionInput {
  eventId:
    string;

  guest:
    CreateEventGuestInput;
}


/* ==========================================================================
   Create Event Guest Action
========================================================================== */

export async function createEventGuestAction({
  eventId,
  guest,
}: CreateEventGuestActionInput): Promise<
  ActionResult<null>
> {
  try {
    await createEventGuest(
      guest
    );

    revalidatePath(
      `/dashboard/dogadaji/${eventId}/gosti`
    );

    return {
      success:
        true,

      data:
        null,
    };
  } catch (error) {
    console.error(
      "Failed to create event guest:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "CREATE_FAILED",
    };
  }
}