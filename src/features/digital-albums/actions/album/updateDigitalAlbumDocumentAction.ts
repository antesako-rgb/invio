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

import {
  DigitalAlbumSaveConflict,
} from "@/features/digital-albums/utils/digitalAlbumRevision";

import type {
  DigitalAlbum,
  UpdateDigitalAlbumDocumentInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumConflictResult {
  success:
    false;

  code:
    "CONFLICT";

  message:
    string;
}


/* ==========================================================================
   Update Digital Album Document Action
========================================================================== */

export async function updateDigitalAlbumDocumentAction(
  input:
    UpdateDigitalAlbumDocumentInput
): Promise<
  | ActionResult<DigitalAlbum>
  | DigitalAlbumConflictResult
> {
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
    if (
      error instanceof
        DigitalAlbumSaveConflict
    ) {
      return {
        success:
          false,

        code:
          "CONFLICT",

        message:
          error.message,
      };
    }

    console.error(
      "updateDigitalAlbumDocumentAction error:",
      error
    );

    return {
      success:
        false,

      message:
        "Unable to save digital album.",
    };
  }
}