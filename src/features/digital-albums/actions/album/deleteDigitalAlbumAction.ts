"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteDigitalAlbum,
} from "@/features/digital-albums/repositories/album/deleteDigitalAlbum";

import type {
  DeleteDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Delete Digital Album Action
========================================================================== */

export async function deleteDigitalAlbumAction(
  input:
    DeleteDigitalAlbumInput
): Promise<ActionResult<void>> {
  try {
    await deleteDigitalAlbum(
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
      "deleteDigitalAlbumAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće obrisati digitalni album.",
    };
  }
}