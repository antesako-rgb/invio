"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  removeEventExperienceImage,
} from "@/features/invitations/repositories/experience/removeEventExperienceImage";


/* ==========================================================================
   Remove Event Experience Image Action
========================================================================== */

export async function removeEventExperienceImageAction(
  experienceId: string,
  imageUrl: string
): Promise<ActionResult<null>> {
  try {
    await removeEventExperienceImage(
      experienceId,
      imageUrl
    );

    return {
      success:
        true,

      data:
        null,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Fotografiju nije moguće obrisati.",
    };
  }
}