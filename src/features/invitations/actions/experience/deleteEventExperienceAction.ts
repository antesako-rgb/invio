"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteEventExperience,
} from "@/features/invitations/repositories/experience/deleteEventExperience";


/* ==========================================================================
   Types
========================================================================== */

interface DeleteEventExperienceActionInput {
  experienceId:
    string;

  eventId:
    string;
}


/* ==========================================================================
   Delete Event Experience Action
========================================================================== */

export async function deleteEventExperienceAction({
  experienceId,
  eventId,
}: DeleteEventExperienceActionInput): Promise<
  ActionResult<null>
> {
  try {
    await deleteEventExperience({
      experienceId,
    });

    revalidatePath(
      `/dashboard/dogadaji/${eventId}/pozivnice`
    );

    return {
      success:
        true,

      data:
        null,
    };
  } catch (error) {
    console.error(
      "Failed to delete event experience:",
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