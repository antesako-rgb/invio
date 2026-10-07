"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  getPublicPhotoWallPhotos,
} from "@/features/photo-walls/repositories/photos/getPublicPhotoWallPhotos";

import type {
  PhotoWallPhotosCursor,
  PublicPhotoWallPhotosPage,
} from "@/features/photo-walls/types/photoWallPhoto.types";

/* ==========================================================================
 Types
========================================================================== */
interface LoadPublicPhotoWallPhotosActionInput {
  publicId: string;
  cursor: PhotoWallPhotosCursor;
}
/* ==========================================================================
 Load Public Photo Wall Photos Action
========================================================================== */

export async function loadPublicPhotoWallPhotosAction(
  input:
    LoadPublicPhotoWallPhotosActionInput
): Promise<ActionResult<PublicPhotoWallPhotosPage>> {
  try {
    const data = await getPublicPhotoWallPhotos(
      {
        publicId:
          input.publicId,

        cursor:
          input.cursor,
      }
    );
    return {
      success:
        true,

      data,
    };
  } catch {
    return {
      success:
        false,

      code:
        "PHOTOS_LOAD_FAILED",
    };
  }
}
