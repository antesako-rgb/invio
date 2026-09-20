"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  uploadDigitalAlbumPhoto,
} from "@/features/digital-albums/repositories/photos/uploadDigitalAlbumPhoto";

import type {
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Upload Digital Album Photo Action
========================================================================== */

export async function uploadDigitalAlbumPhotoAction(
  albumId:
    string,
  file:
    File,
  description?:
    string
): Promise<ActionResult<DigitalAlbumPhoto>> {
  try {
    const photo =
      await uploadDigitalAlbumPhoto({
        albumId,
        file,
        description,
      });

    revalidatePath(
      `/dashboard/albumi/${albumId}`
    );

    revalidatePath(
      `/editor/album/${albumId}/uredi`
    );

    return {
      success:
        true,

      data:
        photo,
    };
  } catch (error) {
    console.error(
      "uploadDigitalAlbumPhotoAction error:",
      error
    );

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