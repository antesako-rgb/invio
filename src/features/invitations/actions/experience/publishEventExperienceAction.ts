"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  publishEventExperience,
} from "@/features/invitations/repositories/experience/publishEventExperience";

import type {
  EventExperience,
  PublishEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Publish Event Experience Action
========================================================================== */

export async function publishEventExperienceAction(
  input: PublishEventExperienceInput
): Promise<ActionResult<EventExperience>> {
  try {
    const experience =
      await publishEventExperience(
        input
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
          : "Nije moguće objaviti event experience.",
    };
  }
}