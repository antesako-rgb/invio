"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  unpublishPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/unpublishPhotoWall";

import type {
  PhotoWall,
  UnpublishPhotoWallArgs,
} from "@/features/photo-walls/types/photoWall.types";


/* ==========================================================================
   Unpublish Photo Wall Action
========================================================================== */

export async function unpublishPhotoWallAction(
  input:
    UnpublishPhotoWallArgs
): Promise<ActionResult<PhotoWall>> {
  try {
    const photoWall =
      await unpublishPhotoWall(
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