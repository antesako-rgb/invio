"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deletePhotoWallPhoto,
} from "@/features/invitations/repositories/photo-wall/deletePhotoWallPhoto";

import type {
  DeletePhotoWallPhotoInput,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Delete Photo Wall Photo Action
========================================================================== */

export async function deletePhotoWallPhotoAction(
  input:
    DeletePhotoWallPhotoInput
): Promise<ActionResult<void>> {
  try {
    await deletePhotoWallPhoto(
      input
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error(
      "deletePhotoWallPhotoAction error:",
      error
    );

    return {
      success: false,
      message:
        "Fotografiju nije moguće obrisati.",
    };
  }
}