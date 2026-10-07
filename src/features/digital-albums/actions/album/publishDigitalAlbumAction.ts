"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  publishDigitalAlbum,
} from "@/features/digital-albums/repositories/album/publishDigitalAlbum";

import type {
  DigitalAlbum,
  PublishDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";

/* ==========================================================================
 Publish Digital Album Action
========================================================================== */

export async function publishDigitalAlbumAction(
  input:
    PublishDigitalAlbumInput
): Promise<ActionResult<DigitalAlbum>> {
  try {
    const album = await publishDigitalAlbum(
      input
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
    console.error(
      "publishDigitalAlbumAction error:",
      error
    );
    return {
      success:
        false,

      code:
        "ALBUM_PUBLISH_FAILED",
    };
  }
}
