"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  unpublishEventExperience,
} from "@/features/invitations/repositories/experience/unpublishEventExperience";

import type {
  EventExperience,
  UnpublishEventExperienceInput,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Unpublish Event Experience Action
========================================================================== */

export async function unpublishEventExperienceAction(
  input: UnpublishEventExperienceInput
): Promise<ActionResult<EventExperience>> {
  try {
    const experience =
      await unpublishEventExperience(
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
          : "Nije moguće ukloniti objavu event experiencea.",
    };
  }
}