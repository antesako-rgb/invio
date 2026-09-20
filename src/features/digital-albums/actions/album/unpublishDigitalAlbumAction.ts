"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionResult,
} from "@/lib/actions/actionResult";

import {
  unpublishDigitalAlbum,
} from "@/features/digital-albums/repositories/album/unpublishDigitalAlbum";

import type {
  DigitalAlbum,
  UnpublishDigitalAlbumInput,
} from "@/features/digital-albums/types/digitalAlbum.types";


/* ==========================================================================
   Unpublish Digital Album Action
========================================================================== */

export async function unpublishDigitalAlbumAction(
  input:
    UnpublishDigitalAlbumInput
): Promise<ActionResult<DigitalAlbum>> {
  try {
    const album =
      await unpublishDigitalAlbum(
        input
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
      "unpublishDigitalAlbumAction error:",
      error
    );

    return {
      success:
        false,

      message:
        error instanceof Error
          ? error.message
          : "Nije moguće ukloniti objavu digitalnog albuma.",
    };
  }
}