"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  publishPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/publishPhotoWall";

import type {
  PhotoWall,
  PublishPhotoWallArgs,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Publish Photo Wall Action
========================================================================== */

export async function publishPhotoWallAction(
  input:
    PublishPhotoWallArgs
): Promise<ActionResult<PhotoWall>> {
  try {
    const photoWall =
      await publishPhotoWall(
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