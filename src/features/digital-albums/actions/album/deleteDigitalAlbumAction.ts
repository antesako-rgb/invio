"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  deleteDigitalAlbumWithStorage,
} from "../../services/deleteDigitalAlbumWithStorage";

/* ==========================================================================
   Server Action
========================================================================== */

export async function deleteDigitalAlbumAction(
  albumId:
    string
): Promise<ActionResult> {
  try {
    await deleteDigitalAlbumWithStorage(
      albumId
    );
    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );
    return {
      success:
        true,
    };
  } catch (error) {
    console.error(
      "deleteDigitalAlbumAction failed:",
      error
    );
    revalidatePath(
      "/[locale]/dashboard",
      "layout"
    );
    return {
      success:
        false,

      code:
        "ALBUM_DELETE_FAILED",
    };
  }
}
