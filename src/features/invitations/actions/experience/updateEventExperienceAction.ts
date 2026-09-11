"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateEventExperience,
} from "@/features/invitations/repositories/experience/updateEventExperience";

import type {
  EventExperience,
  UpdateEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Update Event Experience Action
========================================================================== */

export async function updateEventExperienceAction(
  input:
    UpdateEventExperienceInput
): Promise<ActionResult<EventExperience>> {
  try {
    const experience =
      await updateEventExperience(
        input
      );

    revalidatePath(
      `/dashboard/dogadaji/${experience.event_id}/pozivnice`
    );

    return {
      success:
        true,

      data:
        experience,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ažurirati event experience.",
    };
  }
}