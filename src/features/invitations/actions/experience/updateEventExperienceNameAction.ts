"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateEventExperienceName,
} from "@/features/invitations/repositories/experience/updateEventExperienceName";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface UpdateEventExperienceNameActionInput {
  experienceId:
    string;

  name:
    string;
}


/* ==========================================================================
   Update Event Experience Name Action
========================================================================== */

export async function updateEventExperienceNameAction({
  experienceId,
  name,
}: UpdateEventExperienceNameActionInput): Promise<
  ActionResult<EventExperience>
> {
  const normalizedName =
    name.trim();

  if (!normalizedName) {
    return {
      success:
        false,

      message:
        "INVALID_NAME",
    };
  }

  try {
    const experience =
      await updateEventExperienceName({
        p_invitation_id:
          experienceId,

        p_name:
          normalizedName,
      });

    revalidatePath(
      `/dashboard/pozivnice/${experienceId}`
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
    console.error(
      "Failed to update event experience name:",
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