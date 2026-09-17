"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  reorderDigitalAlbumPhotos,
} from "@/features/digital-albums/repositories/photos/reorderDigitalAlbumPhotos";

import type {
  DigitalAlbumPhoto,
  ReorderDigitalAlbumPhotosInput,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Reorder Digital Album Photos Action
========================================================================== */

export async function reorderDigitalAlbumPhotosAction(
  input:
    ReorderDigitalAlbumPhotosInput
): Promise<ActionResult<DigitalAlbumPhoto[]>> {
  try {
    const photos =
      await reorderDigitalAlbumPhotos(
        input
      );

    revalidatePath(
      `/dashboard/digitalni-albumi/${input.albumId}`
    );

    return {
      success:
        true,

      data:
        photos,
    };
  } catch (error) {
    console.error(
      "reorderDigitalAlbumPhotosAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće promijeniti redoslijed fotografija.",
    };
  }
}