"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateEventGuest,
} from "@/features/guests/repositories/updateEventGuest";

import type {
  UpdateEventGuestInput,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

interface UpdateEventGuestActionInput {
  eventId:
    string;

  guestId:
    string;

  changes:
    UpdateEventGuestInput;
}


/* ==========================================================================
   Update Event Guest Action
========================================================================== */

export async function updateEventGuestAction({
  eventId,
  guestId,
  changes,
}: UpdateEventGuestActionInput): Promise<
  ActionResult<null>
> {
  try {
    await updateEventGuest(
      guestId,
      changes
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
      "Failed to update event guest:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "UPDATE_FAILED",
    };
  }
}