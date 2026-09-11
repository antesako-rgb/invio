"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  createEventExperience,
} from "@/features/invitations/repositories/experience/createEventExperience";

import type {
  CreateEventExperienceInput,
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Create Event Experience Action
========================================================================== */

export async function createEventExperienceAction(
  input:
    CreateEventExperienceInput
): Promise<ActionResult<EventExperience>> {
  try {
    const experience =
      await createEventExperience(
        input
      );

    revalidatePath(
      `/dashboard/dogadaji/${input.eventId}/pozivnice`
    );

    return {
      success:
        true,

      data:
        experience,
    };
  } catch (error) {
    console.error(
      "createEventExperienceAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće kreirati event experience.",
    };
  }
}