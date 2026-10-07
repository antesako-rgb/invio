"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  uploadPhotoWallPhoto,
} from "@/features/photo-walls/repositories/photos/uploadPhotoWallPhoto";

import type {
  PhotoWallPhoto,
  UploadPhotoWallPhotoInput,
} from "@/features/photo-walls/types/photoWallPhoto.types";

/* ==========================================================================
 Upload Photo Wall Photo Action
========================================================================== */

export async function uploadPhotoWallPhotoAction(
  input:
    UploadPhotoWallPhotoInput
): Promise<ActionResult<PhotoWallPhoto>> {
  try {
    const photo = await uploadPhotoWallPhoto(
      input
    );
    return {
      success:
        true,

      data:
        photo,
    };
  } catch (error) {
    console.error(
      "uploadPhotoWallPhotoAction failed:",
      error
    );
    return {
      success:
        false,

      code:
        "PHOTO_UPLOAD_FAILED",
    };
  }
}
