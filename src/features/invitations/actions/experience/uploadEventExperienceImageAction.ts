"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  uploadEventExperienceImage,
} from "@/features/invitations/repositories/experience/uploadEventExperienceImage";


/* ==========================================================================
   Upload Event Experience Image Action
========================================================================== */

export async function uploadEventExperienceImageAction(
  file: File,
  experienceId: string
): Promise<ActionResult<string>> {
  try {
    const imageUrl =
      await uploadEventExperienceImage(
        file,
        experienceId
      );

    return {
      success:
        true,

      data:
        imageUrl,
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Fotografiju nije moguće prenijeti.",
    };
  }
}