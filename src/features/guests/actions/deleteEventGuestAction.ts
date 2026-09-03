"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteEventGuest,
} from "@/features/guests/repositories/deleteEventGuest";


/* ==========================================================================
   Types
========================================================================== */

interface DeleteEventGuestActionInput {
  guestId:
    string;

  eventId:
    string;
}


/* ==========================================================================
   Delete Event Guest Action
========================================================================== */

export async function deleteEventGuestAction({
  guestId,
  eventId,
}: DeleteEventGuestActionInput): Promise<
  ActionResult<null>
> {
  try {
    await deleteEventGuest(
      guestId
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
      "Failed to delete event guest:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "DELETE_FAILED",
    };
  }
}