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

/* ==========================================================================
   Update Digital Album Document Action
========================================================================== */

export async function updateDigitalAlbumDocumentAction(
  input:
    UpdateDigitalAlbumDocumentInput
): Promise<
  ActionResult<DigitalAlbum, "CONFLICT" | "SAVE_FAILED">
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
      "/[locale]/dashboard",
      "layout"
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
      };
    }

    console.error(
      "updateDigitalAlbumDocumentAction error:",
      error
    );

    return {
      success:
        false,

      code:
        "SAVE_FAILED",
    };
  }
}
