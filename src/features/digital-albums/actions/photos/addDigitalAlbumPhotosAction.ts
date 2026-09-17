"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  addDigitalAlbumPhotos,
} from "@/features/digital-albums/repositories/photos/addDigitalAlbumPhotos";

import type {
  AddDigitalAlbumPhotosInput,
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Add Digital Album Photos Action
========================================================================== */

export async function addDigitalAlbumPhotosAction(
  input:
    AddDigitalAlbumPhotosInput
): Promise<ActionResult<DigitalAlbumPhoto[]>> {
  try {
    const photos =
      await addDigitalAlbumPhotos(
        input
      );

  revalidatePath(
  `/dashboard/albumi/${input.albumId}`
);
    return {
      success:
        true,

      data:
        photos,
    };
  } catch (error) {
    console.error(
      "addDigitalAlbumPhotosAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće dodati fotografije u digitalni album.",
    };
  }
}