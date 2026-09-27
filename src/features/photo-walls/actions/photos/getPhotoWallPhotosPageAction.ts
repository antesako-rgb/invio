"use server";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  getPhotoWallPhotosPage,
} from "@/features/photo-walls/repositories/photos/getPhotoWallPhotosPage";

import type {
  GetPhotoWallPhotosPageInput,
  PhotoWallPhotosPage,
} from "@/features/photo-walls/types/photoWallPhoto.types";


/* ==========================================================================
   Get Photo Wall Photos Page Action
========================================================================== */

export async function getPhotoWallPhotosPageAction(
  input:
    GetPhotoWallPhotosPageInput
): Promise<ActionResult<PhotoWallPhotosPage>> {
  try {
    const page =
      await getPhotoWallPhotosPage(
        input
      );

    return {
      success:
        true,

      data:
        page,
    };
  } catch (error) {
    console.error(
      "getPhotoWallPhotosPageAction error:",
      error
    );

    return {
      success:
        false,

      message:
        "Fotografije nije moguće dohvatiti.",
    };
  }
}