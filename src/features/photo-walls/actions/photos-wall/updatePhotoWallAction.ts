"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updatePhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/updatePhotoWall";

import type {
  PhotoWall,
  UpdatePhotoWallArgs,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Update Photo Wall Action
========================================================================== */

export async function updatePhotoWallAction(
  input:
    UpdatePhotoWallArgs
): Promise<ActionResult<PhotoWall>> {
  try {
    const photoWall =
      await updatePhotoWall(
        input
      );

    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );

    revalidatePath(
      "/[locale]/photo-wall/[publicId]",
      "page"
    );

    return {
      success:
        true,

      data:
        photoWall,
    };
  } catch (
    error
  ) {
    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Photo Wall operation failed.",
    };
  }
}