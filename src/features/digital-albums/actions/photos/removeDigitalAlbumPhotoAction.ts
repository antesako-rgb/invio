"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  removeDigitalAlbumPhoto,
} from "@/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto";

import type {
  RemoveDigitalAlbumPhotoInput,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Remove Digital Album Photo Action
========================================================================== */

export async function removeDigitalAlbumPhotoAction(
  input:
    RemoveDigitalAlbumPhotoInput
): Promise<ActionResult<void>> {
  try {
    await removeDigitalAlbumPhoto(
      input
    );

    revalidatePath(
      `/dashboard/digitalni-albumi/${input.albumId}`
    );

    return {
      success:
        true,

      data:
        undefined,
    };
  } catch (error) {
    console.error(
      "removeDigitalAlbumPhotoAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ukloniti fotografiju iz digitalnog albuma.",
    };
  }
}