"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateDigitalAlbum,
} from "@/features/digital-albums/repositories/album/updateDigitalAlbum";

import type {
  DigitalAlbum,
  UpdateDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Update Digital Album Action
========================================================================== */

export async function updateDigitalAlbumAction(
  input:
    UpdateDigitalAlbumInput
): Promise<ActionResult<DigitalAlbum>> {
  try {
    const album =
      await updateDigitalAlbum(
        input
      );

    revalidatePath(
      `/dashboard/digitalni-albumi/${input.albumId}`
    );

    return {
      success:
        true,

      data:
        album,
    };
  } catch (error) {
    console.error(
      "updateDigitalAlbumAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ažurirati digitalni album.",
    };
  }
}