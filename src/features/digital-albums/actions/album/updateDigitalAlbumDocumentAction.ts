"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  updateDigitalAlbumDocument,
} from "@/features/digital-albums/repositories/album/updateDigitalAlbumDocument";

import type {
  DigitalAlbum,
  UpdateDigitalAlbumDocumentInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Update Digital Album Document Action
========================================================================== */

export async function updateDigitalAlbumDocumentAction(
  input:
    UpdateDigitalAlbumDocumentInput
): Promise<ActionResult<DigitalAlbum>> {
  try {
    const album =
      await updateDigitalAlbumDocument(
        input
      );

    revalidatePath(
      `/editor/album/${input.albumId}/uredi`
    );

    revalidatePath(
      `/dashboard/albumi/${input.albumId}`
    );

    return {
      success:
        true,

      data:
        album,
    };
  } catch (error) {
    console.error(
      "updateDigitalAlbumDocumentAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće spremiti digitalni album.",
    };
  }
}