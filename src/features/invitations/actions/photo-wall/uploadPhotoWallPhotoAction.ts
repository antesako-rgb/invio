"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  uploadPhotoWallPhoto,
} from "@/features/invitations/repositories/photo-wall/uploadPhotoWallPhoto";

import type {
  PhotoWallPhoto,
  UploadPhotoWallPhotoInput,
} from "@/features/invitations/types/photoWallPhoto.types";


/* ==========================================================================
   Upload Photo Wall Photo Action
========================================================================== */

export async function uploadPhotoWallPhotoAction(
  input:
    UploadPhotoWallPhotoInput
): Promise<ActionResult<PhotoWallPhoto>> {
  try {
    const photo =
      await uploadPhotoWallPhoto(
        input
      );

    return {
      success: true,
      data: photo,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Fotografiju nije moguće prenijeti.",
    };
  }
}